#!/usr/bin/env bash
set -e

AWS_REGION="us-east-1"

TEMPORARY_BUCKET="temporary-media"
CONTENT_BUCKET="content"

SNS_TOPIC_NAME="s3-notification"

SQS_IMAGE_QUEUE="image-queue"
SQS_VIDEO_QUEUE="video-queue"

ENDPOINT_URL="http://localhost:4566" # remove if using AWS


# 1. Create S3 bucket
function create_s3_bucket {

aws s3api create-bucket \
  --bucket "$TEMPORARY_BUCKET" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" || true

aws s3api create-bucket \
  --bucket "$CONTENT_BUCKET" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" || true

}


# 2. Create SNS topic
function create_sns {

SNS_TOPIC_ARN=$(aws sns create-topic \
  --name "$SNS_TOPIC_NAME" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" \
  --query 'TopicArn' --output text)

echo "SNS Topic ARN: $SNS_TOPIC_ARN"

aws s3api put-bucket-notification-configuration \
  --bucket "$TEMPORARY_BUCKET" \
  --notification-configuration "{
    \"TopicConfigurations\": [
      {
        \"TopicArn\": \"$SNS_TOPIC_ARN\",
        \"Events\": [\"s3:ObjectCreated:*\"] 
      }
    ]
  }" \
  --endpoint-url "$ENDPOINT_URL"

aws s3api put-bucket-cors \
  --bucket "$TEMPORARY_BUCKET" \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedOrigins": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ]
  }' \
  --endpoint-url "$ENDPOINT_URL"

}


# 3. Create SQS queues
function create_sqs_queue {

for QNAME in "$SQS_IMAGE_QUEUE" "$SQS_VIDEO_QUEUE"; do

echo "⏳ Creating queue: $QNAME"
QURL=$(aws sqs create-queue \
  --queue-name "$QNAME" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" \
  --query 'QueueUrl' --output text)

QARN=$(aws sqs get-queue-attributes \
  --queue-url "$QURL" \
  --attribute-names QueueArn \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" \
  --query 'Attributes.QueueArn' --output text)

# Allow SNS to send messages
POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "sns.amazonaws.com" },
      "Action": "sqs:SendMessage",
      "Resource": "$QARN",
      "Condition": {
        "ArnEquals": { "aws:SourceArn": "$SNS_TOPIC_ARN" }
      }
    }
  ]
}
EOF
)

# Escape newlines and quotes for AWS CLI
ESCAPED_POLICY=$(echo "$POLICY" | jq -Rs '.')

# Apply the policy
aws sqs set-queue-attributes \
  --queue-url "$QURL" \
  --attributes "{\"Policy\":$ESCAPED_POLICY}" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL"

done

}


# 4. Subscribe queues to SNS topic with filter policies
function subscribe_queue_sns {

IMAGE_QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name "$SQS_IMAGE_QUEUE" --endpoint-url "$ENDPOINT_URL" --query 'QueueUrl' --output text) \
  --attribute-names QueueArn \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" \
  --query 'Attributes.QueueArn' --output text)

VIDEO_QUEUE_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name "$SQS_VIDEO_QUEUE" --endpoint-url "$ENDPOINT_URL" --query 'QueueUrl' --output text) \
  --attribute-names QueueArn \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" \
  --query 'Attributes.QueueArn' --output text)


SNS_TOPIC_ARN=$(aws sns list-topics \
  --query "Topics[?contains(TopicArn, '$SNS_TOPIC_NAME')].TopicArn"\
  --region "$AWS_REGION"\
  --endpoint-url "$ENDPOINT_URL"\
  --output text)

echo "SNS Topic ARN: $SNS_TOPIC_ARN"
echo "Image Queue ARN: $IMAGE_QUEUE_ARN"
echo "Video Queue ARN: $VIDEO_QUEUE_ARN"  

echo "⏳ subscribing image queue to sns topic"
aws sns subscribe \
  --topic-arn "$SNS_TOPIC_ARN" \
  --protocol sqs \
  --notification-endpoint "$IMAGE_QUEUE_ARN" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL"
echo "✅ subscribed image queue to sns topic"

echo "⏳ subscribing video queue to sns topic"
aws sns subscribe \
  --topic-arn "$SNS_TOPIC_ARN" \
  --protocol sqs \
  --notification-endpoint "$VIDEO_QUEUE_ARN" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL"
echo "✅ subscribed video queue to sns topic"

}



# ------ function invocation -------
create_s3_bucket
create_sns
create_sqs_queue
subscribe_queue_sns

echo "✅ Setup complete!"
