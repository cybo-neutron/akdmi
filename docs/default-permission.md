| Role    | Resource   | create | read | update | delete |
| ------- | ---------- | ------ | ---- | ------ | ------ |
| Student | course     | false  | true | false  | false  |
| Student | user       | false  | true | false  | false  |
| Student | content    | false  | true | false  | false  |
| Student | permission | false  | true | false  | false  |
| Mentor  | course     | true   | true | true   | true   |
| Mentor  | user       | false  | true | false  | false  |
| Mentor  | content    | true   | true | true   | true   |
| Mentor  | permission | false  | true | false  | false  |
| Manager | course     | true   | true | true   | true   |
| Manager | user       | true   | true | true   | true   |
| Manager | content    | true   | true | true   | true   |
| Manager | permission | true   | true | true   | true   |
| Admin   | course     | true   | true | true   | true   |
| Admin   | user       | true   | true | true   | true   |
| Admin   | content    | true   | true | true   | true   |
| Admin   | permission | true   | true | true   | true   |



Token
    - accountId
    - userId
    - role


checkPermission({
    userId,
    role,
    resource,
    action,
    accountId
}){

}