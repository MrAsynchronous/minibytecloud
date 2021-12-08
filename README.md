# MiniBytes Cloud
### Abstract
Backend of the Comp Sci 1050 final project, MiniBytes.  This application is built on the Node.js environment using Express as the webserver framework.  MongoDB is used to store information about users, and the bytes they post.  Mongoose is the NPM package used to abstract the raw MongoDB operations from the rest of the applicaton.

### Deployment
This application is intended to be deployed on a Kubernetes Cluster to allow for horizontal scaling.  The application can run on any port, but 8080 is expected.  

### Interface
The API of this application is made of up a few GET and POST endpoints.  There are two high level routes, /users and /bytes.  There are several endpoints that can be found within each of these routes.