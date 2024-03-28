/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 * localhost:
 *   mongo issuetracker scripts/init.mongo.js
 * Atlas:
 *   mongo mongodb+srv://user:pwd@xxx.mongodb.net/issuetracker scripts/init.mongo.js
 * MLab:
 *   mongo mongodb://user:pwd@xxx.mlab.com:33533/issuetracker scripts/init.mongo.js
 */

db.travellers.remove({});
db.blacklist.remove({});

/*Q1. Enter the code for adding the initial list of Travellers here.
 * Create a list of Travellers with necessary fields. 
 * Enter the list of travellers into the DB collection named 'travellers'.
 * */
// Insert initial list of Travellers
db.travellers.insertMany([
  { id: 1, name: "John Doe", phone: 9889187, bookingTime: new Date("2024-01-01") },
  { id: 2, name: "Jane Smith", phone: 86972222, bookingTime: new Date("2024-01-02") },
  { id: 3, name: "Emily Davis", phone: 98686862, bookingTime: new Date("2024-01-03") },
]);

// Insert initial list of Blacklisted individuals (example)
db.blacklist.insertMany([
  { name: "Troublesome Traveler", phone: 99667282 }
]);

/*Q1 code ends here*/


const count = db.travellers.count();
print('Inserted', count, 'Travellers');

//The _id below is just a placeholder. The below collection, in fact, has only one row and one column. We can denote this by any name but we call this fixedindex.
db.counters.remove({ _id: 'travellerid' });
db.counters.insert({ _id: 'travellerid', current: count });

db.travellers.createIndex({ id: 1 }, { unique: true });
db.travellers.createIndex({ name: 1 });
db.travellers.createIndex({ phone: 1 }, { unique: true });
db.travellers.createIndex({ bookingTime: 1 });

print('Initialized database with sample data.');