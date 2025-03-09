const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'oldDB.json');
const filePathSave = path.join(__dirname, 'db.json');

// Read the existing oldDB.json file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading oldDb.json:', err);
    return;
  }

  // Parse the JSON data
  const jsonData = JSON.parse(data);

  // Create an array to hold the values with ids
  const ports = Object.entries(jsonData).map(([key, value]) => ({
    id: key,
    ...value
  }));

  // Create the new JSON structure
  const updatedData = { ports };

  // Write the updated data back to db.json
  fs.writeFile(filePathSave, JSON.stringify(updatedData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to db.json:', err);
      return;
    }
    console.log('db.json has been updated successfully.');
  });
});
