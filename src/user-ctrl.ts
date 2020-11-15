import {
  onFirebaseUserCreate,
  onFirebaseUserDelete,
  onFirestoreCreate,
  onFirestoreUpdate,
  onFirestoreDelete,
  onFirestoreWrite,
  onPubSubPublish,
  onRequest,
  onPubSubSchedule,
} from 'firebase-triggers';

export class UserCtrl {

  @onFirebaseUserCreate()
  onCreate(user, context) {
    console.log(`${user.displayName} joined us`);
  }

  @onFirebaseUserDelete()
  onDelete(user, context) {
    console.log(`${user.displayName} left us`);
  }

  @onFirestoreCreate('users/{uid}')
  docCreate(snapshot, context) {
    // Get an object representing the document. e.g. { name: 'Robin Hood', age: 42, ... }
    const newValue = snapshot.data();
    // access a particular field as you would any JS property
    const name = newValue.name;
    const age = newValue.age;

    console.log(`${name} is ${age} years old.`);
  }

  @onFirestoreUpdate('users/{id}')
  docUpdate(change, context) {
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
  docDelete(snapshot, context) {
    // Get an object representing the document. e.g. { name: 'Robin Hood', age: 42, ... }
    const oldValue = snapshot.data();
    // access a particular field as you would any JS property
    const name = oldValue.name;

    console.log(`User "${name}" was removed from collection`);
  }

  @onFirestoreWrite('user/{id}')
  docWrite(change, context) {
    // Get an object representing the document. e.g. { name: 'Robin Hood', age: 42, ... }
    const newDocument = change.after.exists ? change.after.data() : null;
    // Get an object with the previous document value (for update or delete)
    const oldDocument = change.before.exists ? change.before.data() : null;

    if (!newDocument) {
      const name = oldDocument.name;
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
  pubsubSubscribe(message, context) {
    const publishedData = message.json;
    console.log('Data published via PubSub on my-topic:', publishedData);
  }

  @onPubSubSchedule('0 5 * * *')
  everyDayAtFiveAM(context) {
    console.log('Method executed every day at 5 AM');
  }

  @onRequest('myCustomPath')
  httpRequest(request, response) {
    const requestBody = request.body;
    console.log({ requestBody });

    response.send('Custom response!');
  }

  @onRequest()
  helloWorld(request, response) {
    response.send('Hello World!');
  }

  @onRequest()
  get(request, response) {
    response.json({
      name: 'Robin Hood',
      age: 42
    });
  }

}
