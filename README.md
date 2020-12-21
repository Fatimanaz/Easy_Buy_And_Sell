# Easy Buy and Sell
In this project, we have developed a website(Easy Buy) for Buy and Sell purpose of second-hand products.
### key-features
- Login system with Google Authentication using passport.js
- Web Sharing API to share the product.
- Search Functionality
- Edit and delete the Product
- My Profile page
- Dual Theme
#### Note
To understand implementation of features please read [Project Report](https://docs.google.com/document/d/1gm7owc-ZvE5L6151nMSsyL41QfZMGMS_CKWhl2v7I8g/edit?usp=sharing)
## Prerequisites
- Node.js
- MongoDB

## Note for google authentication
please make sure to get your client id and client secret from google console apis ans write them in app.js inside google strategy. if you do not know google authentication using passportJs please refer [here](http://www.passportjs.org/docs/google/)

## Getting Started
- clone the repo 
`git clone `
- install node_modules
  ```
  cd Easy_Buy_And_Sell
  npm install
  ```
- start your database in another terminal
` mongod`
- start the server
` node app.js`
- open http://localhost:8000 in your browser.
