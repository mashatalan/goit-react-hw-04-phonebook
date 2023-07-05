import React, { Component } from 'react';
import { nanoid } from 'nanoid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Container } from './App.styled';
import Phonebook from './Phonebook';
import ContactList from './ContactList';
import Filter from './Filter';
import css from './Notification.module.css';

const LS_KEY = 'contacts';


const notification = (message) => {
  toast.warn(`🦄 ${message}`, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: css.custom,
    theme: 'light',
  });
};

class App extends Component {
  state = {
    contacts: [],
    filter: '',
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.contacts !== this.state.contacts) {
      localStorage.setItem(LS_KEY, JSON.stringify(this.state.contacts));
    }
  }

  componentDidMount() {
    const savedContacts = JSON.parse(localStorage.getItem(LS_KEY));
    if (savedContacts) {
      this.setState({ contacts: savedContacts });
    }
  }

  isContactUnique = (newName) => {
    return this.state.contacts.some(({ name }) => name === newName);
  };

  validateName = (name) => {
    const namePattern = /^[a-zA-Zа-яА-Я]+(([' -][a-zA-Zа-яА-Я ])?[a-zA-Zа-яА-Я]*)*$/;
    return namePattern.test(name);
  };

  validateNumber = (number) => {
    const numberPattern = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return numberPattern.test(number);
  };

  addContact = (newName, number) => {
    if (this.isContactUnique(newName)) {
      notification(`${newName} is already in contacts.`);
      return;
    }

    if (!this.validateName(newName)) {
      notification('Please enter a valid name');
      return;
    }

    if (!this.validateNumber(number)) {
      notification('Please enter a valid phone number');
      return;
    }

    const newContact = {
      id: nanoid(),
      name: newName,
      number,
    };

    this.setState(prevState => ({
      contacts: [newContact, ...prevState.contacts],
    }));
  };

  deleteContact = contactId => {
    const deletedContact = this.state.contacts.find(contact => contact.id === contactId);
    if (deletedContact) {
      const { name } = deletedContact;
      this.setState(({ contacts }) => ({
        contacts: contacts.filter(contact => contact.id !== contactId),
      }));
      notification(`Deleted contact: ${name}`);
    }
  };

  changeFilter = evt => {
    this.setState({ filter: evt.currentTarget.value });
  };

  filterList = () => {
    const { contacts, filter } = this.state;
    const normalizedFilter = filter.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(normalizedFilter),
    );
  };

  render() {
    const { filter } = this.state;
    const filteredContacts = this.filterList();

    return (
      <Container>
        <h1>Phonebook</h1>
        <Phonebook onAddContact={this.addContact} />

        <h2>Contacts</h2>
        <Filter value={filter} onChange={this.changeFilter} />
        {filteredContacts.length > 0 ? (
          <ContactList
            contacts={filteredContacts}
            onDeleteContact={this.deleteContact}
          />
        ) : (
          <p>No contacts found</p>
        )}
        <ToastContainer />
      </Container>
    );
  }
}

export default App;
