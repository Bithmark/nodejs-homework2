const fs = require("fs/promises");

const path = require("path");
const contactsPath = path.join(__dirname, "./contacts.json");

const { v4 } = require("uuid");

async function listContacts() {
  try {
    const data = await fs.readFile(contactsPath);
    return JSON.parse(data);
  } catch (error) {
    console.error(error.message);
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((item) => item.id === +contactId);
    if (!contact) {
      return null;
    }
    return contact;
  } catch (error) {
    console.error(error.message);
  }
}

async function removeContact(contactId) {
  try {
    const contacts = await listContacts();
    const newContact = contacts.filter((item) => item.id !== +contactId);
    await fs.writeFile(contactsPath, JSON.stringify(newContact));
    return "Success remove";
  } catch (error) {
    console.error(error.message);
  }
}

async function addContact(data) {
  try {
    const contacts = await listContacts();
    const newContact = { id: v4(), ...data };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return newContact;
  } catch (error) {
    console.error(error.message);
  }
}

async function updateContact(contactId, newData) {
  const contacts = await listContacts();

  const idx = contacts.findIndex((contact) => contact.id === +contactId);
  if (idx === -1) {
    return null;
  }
  const updatedContact = { ...contacts[idx], ...newData };
  contacts[idx] = updatedContact;

  await fs.writeFile(contactsPath, JSON.stringify(contacts));
  return updatedContact;
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};
