#!/usr/bin/env bash
set -e

AWS_REGION="us-east-1"
BUCKET_NAME="temporary-media"
BUCKET_VIDEO_NAME="videos"
BUCKET_IMAGE_NAME="images"
SNS_TOPIC_NAME="s3-notification"
SQS_IMAGE_QUEUE="image-queue"
SQS_VIDEO_QUEUE="video-queue"
ENDPOINT_URL="http://localhost:4566" # remove if using AWS

# 1. Create SNS topic
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name "$SNS_TOPIC_NAME" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" \
  --query 'TopicArn' --output text)
echo "SNS Topic ARN: $SNS_TOPIC_ARN"

# 2. Create SQS queues
for QNAME in "$SQS_IMAGE_QUEUE" "$SQS_VIDEO_QUEUE"; do
  echo "Creating queue: $QNAME"
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

# 3. Get ARNs of queues
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

# 4. Subscribe queues to SNS topic with filter policies
aws sns subscribe \
  --topic-arn "$SNS_TOPIC_ARN" \
  --protocol sqs \
  --notification-endpoint "$IMAGE_QUEUE_ARN" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL"

aws sns subscribe \
  --topic-arn "$SNS_TOPIC_ARN" \
  --protocol sqs \
  --notification-endpoint "$VIDEO_QUEUE_ARN" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL"

# 5. Create S3 bucket
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" || true

aws s3api create-bucket \
  --bucket "$BUCKET_VIDEO_NAME" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" || true

aws s3api create-bucket \
  --bucket "$BUCKET_IMAGE_NAME" \
  --region "$AWS_REGION" \
  --endpoint-url "$ENDPOINT_URL" || true

# 6. Configure S3 → SNS notifications for both folders
aws s3api put-bucket-notification-configuration \
  --bucket "$BUCKET_NAME" \
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
  --bucket "$BUCKET_NAME" \
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

echo "✅ Setup complete!"
echo "Upload to s3://$BUCKET_NAME/ → goes to image-queue"
echo "Upload to s3://$BUCKET_NAME/ → goes to video-queue"
