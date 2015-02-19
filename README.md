# TreeChats
Demo for TreeHacks | Winter 2015

# Summary
This simple chat app uses MongoDB as a datastore for all transmitted messages. In v1, only the message is sent to the server whereas in v2 a date and message are sent as well as received. This demonstrates the flexible schema of MongoDB. The use of v1 and v2 store two versions of a message but require no immediate modifications to the collection in MongoDB.

# Usage

1. Install

```
npm install
```
    
2. Run

```
cd src; node server.js
```