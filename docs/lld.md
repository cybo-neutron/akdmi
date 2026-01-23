Role(enum)
    - ADMIN
    - MENTOR
    - STUDENT
    - MANAGER

Account
    - id : string
    - name : string
    - users : User[]
    - createdAt : Date
    - updatedAt : Date
    - isActive : boolean

User
    - id : string
    - firstName : string
    - lastName : string
    - email : string
    - password : string
    - createdAt : Date
    - updatedAt : Date
    - isActive : boolean

AccountUser
    - accountId : string
    - userId : string
    - role : Role
    - isActive : boolean
    - createdAt : Date
    - updatedAt : Date


ContentType (enum)
    - textData
    - mediaData
      - video
      - audio
      - image
    - documentData
      - pdf
      - doc
      - ppt
      - other


Content
    - id : string
    - title : string
    - description : string
    - type : ContentType
    - content : ContentTextData | ContentMediaData | ContentDocumentData
    - subContents : Content[]
    - createdAt : Date
    - updatedAt : Date
    - isActive : boolean
    - createdBy : User
    - lastUpdatedBy : User

ContentTextData
    - id : string
    - content : string
    - createdAt : Date
    - updatedAt : Date
    - isActive : boolean

ContentMediaData
    - id : string
    - url : string
    - type : video | audio | image
    - createdAt : Date
    - updatedAt : Date
    - isActive : boolean

ContentDocumentData
    - id : string
    - url : string
    - type : pdf | doc | ppt | other
    - createdAt : Date
    - updatedAt : Date
    - isActive : boolean

Course
    - id : string
    - title : string
    - description : string
    - content : Content[]
    - createdAt : Date
    - updatedAt : Date
    - isActive : boolean
    - createdBy : User
    - lastUpdatedBy : User


ResourceEnum
    - course
    - user
    - content

PermissionEnum
    - create
    - read
    - update
    - delete

AccountRoleResourcePermission
    - account : Account
    - resource : ResourceEnum
    - role : Role
    - permission : PermissionEnum[]

UserAccountResourcePermission
    - user : User
    - account : Account
    - resource : ResourceEnum
    - permission : PermissionEnum[]

