import { UserRecord } from 'firebase-admin/auth';
import { EventContext, Request, Response, Change } from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/v2/firestore';
import { Message } from 'firebase-functions/v2/pubsub';
import { ObjectMetadata } from 'firebase-functions/v1/storage';
import {
  onFirebaseUserCreate,
  onFirebaseUserDelete,
  onFirestoreCreate,
  onFirestoreUpdate,
  onFirestoreDelete,
  onFirestoreWrite,
  onPubSubPublish,
  onPubSubSchedule,
  onRequest, GET, POST, PUT, PATCH, DELETE,
  onStorageArchive, onStorageDelete, onStorageFinalize, onStorageMetadataUpdate, onCall
} from 'firebase-triggers';

export class UserCtrl {

  @onCall()
  doSomething(data: any, context: EventContext) {
    // This method can be called by Firebase SDK to do anything you want
    console.log('callable method doSomething() executed');
  }

  @onFirebaseUserCreate()
  onCreate(user: UserRecord, context: EventContext) {
    console.log(`${user.displayName} joined us`);
  }

  @onFirebaseUserDelete()
  onDelete(user: UserRecord, context: EventContext) {
    console.log(`${user.displayName} left us`);
  }

  @onFirestoreCreate('users/{uid}')
  docCreate(snapshot: QueryDocumentSnapshot, context: EventContext) {
    // Get an object representing the document. e.g. { name: 'Robin Hood', age: 42, ... }
    const newValue = snapshot.data();
    // access a particular field as you would any JS property
    const name = newValue.name;
    const age = newValue.age;

    console.log(`${name} is ${age} years old.`);
  }

  @onFirestoreUpdate('users/{id}')
  docUpdate(change: Change<QueryDocumentSnapshot>, context: EventContext) {
    // Get an object representing the document. e.g. { name: 'Robin Hood', age: 42, ... }
    const newValue = change.after.data();
    // ...or the previous value before this update
    const previousValue = change.before.data();
    // access a particular field as you would any JS property
    const newAge = newValue.age;
    const oldAge = previousValue.age;

    console.log(`Changed age from "${oldAge}" to "${newAge}"`);
  }

  @onFirestoreDelete('users/{id}')
  docDelete(snapshot: QueryDocumentSnapshot, context: EventContext) {
    // Get an object representing the document. e.g. { name: 'Robin Hood', age: 42, ... }
    const oldValue = snapshot.data();
    // access a particular field as you would any JS property
    const name = oldValue.name;

    console.log(`User "${name}" was removed from collection`);
  }

  @onFirestoreWrite('user/{id}')
  docWrite(change: Change<QueryDocumentSnapshot>, context: EventContext) {
    // Get an object representing the document. e.g. { name: 'Robin Hood', age: 42, ... }
    const newDocument = change.after.exists ? change.after.data() : undefined;
    // Get an object with the previous document value (for update or delete)
    const oldDocument = change.before.exists ? change.before.data() : undefined;

    if (!newDocument) {
      const name = oldDocument?.name;
      console.log(`User "${name}" was removed from collection`);
      return;
    }

    if (!oldDocument) {
      const name = newDocument.name;
      const age = newDocument.age;
      console.log(`${name} is ${age} years old.`);
      return;
    }

    const newAge = newDocument.age;
    const oldAge = oldDocument.a;

    console.log(`Changed age from "${oldAge}" to "${newAge}"`);
  }

  @onPubSubPublish('my-topic')
  pubsubSubscribe(message: Message<any>, context: EventContext) {
    const publishedData = message.json;
    console.log('Data published via PubSub on my-topic:', publishedData);
  }

  @onPubSubSchedule('0 5 * * *')
  everyDayAtFiveAM(context: EventContext) {
    console.log('Method executed every day at 5 AM');
  }

  @onRequest('myCustomPath')
  httpRequest(request: Request, response: Response) {
    const requestBody = request.body;
    console.log({ requestBody });

    response.send('Custom response!');
  }

  @onRequest()
  helloWorld(request: Request, response: Response) {
    response.send('Hello World!');
  }

  @GET('users')
  get(request: Request, response: Response) {
    const id = request.path.split('/')[1];
    let data;
    if (id) {
      // TODO: Load user data
      data = {
        name: 'Robin Hood',
        age: 42
      };
    } else {
      // TODO: Load user list
      data = [];
    }
    response.json(data);
  }

  @POST('users')
  post(request: Request, response: Response) {
    // TODO: Insert user data
    response
      .status(201)
      .json({ success: true, msg: 'User created' });
  }

  @PUT('users')
  put(request: Request, response: Response) {
    const id = request.path.split('/')[1];
    const data = request.body;

    // TODO: Insert user data
    id;
    data;

    response
      .status(201)
      .json({ success: true, msg: 'User updated' });
  }

  @PATCH('users')
  patch(request: Request, response: Response) {
    const id = request.path.split('/')[1];
    const data = request.body;
    
    // TODO: Update partial user data
    id;
    data;

    response
      .status(201)
      .json({ success: true, msg: 'User updated partially' });
  }

  @DELETE('users')
  del(request: Request, response: Response) {
    const id = request.path.split('/')[1];
    
    // TODO: Remove user data
    id;

    response
      .status(201)
      .json({ success: true, msg: 'User removed' });
  }

  @onStorageArchive()
  onArchiveFile(object: ObjectMetadata, context: EventContext) {
    // You can add the bucketName as a parameter on the @onStorageArquive() decorator also
    // but the bucket must exist
    console.log(`File ${object.name} archived`);
  }
  
  @onStorageDelete()
  onDeleteFile(object: ObjectMetadata, context: EventContext) {
    // You can add the bucketName as a parameter on the @onStorageDelete() decorator also
    // but the bucket must exist
    console.log(`File ${object.name} deleted`);
  }

  @onStorageFinalize()
  onFinalizeFileUpload(object: ObjectMetadata, context: EventContext) {
    // You can add the bucketName as a parameter on the @onStorageFinalize() decorator also
    // but the bucket must exist
    console.log(`File ${object.name} uploaded`);
  }

  @onStorageMetadataUpdate()
  onUpdateFileMetadata(object: ObjectMetadata, context: EventContext) {
    // You can add the bucketName as a parameter on the @onStorageMetadataUpdate() decorator also
    // but the bucket must exist
    console.log(`File ${object.name} updated`);
  }

  @onRequest({
    memory: '128MB',
    timeoutSeconds: 60,
    minInstances: 2,
    maxInstances: 4,
    vpcConnectorEgressSettings: 'ALL_TRAFFIC',
    ingressSettings: 'ALLOW_ALL',
    invoker: 'public',
    region: 'us-east1'
  })
  httpRequestWithCustomSetup(request: Request, response: Response) {
    const requestBody = request.body;
    console.log({ requestBody });

    response.send('Custom response!');
  }
}
