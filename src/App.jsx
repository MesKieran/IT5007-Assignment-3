import React from 'react';
import ReactDOM from 'react-dom';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');
function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class TravellerList extends React.Component {
  constructor() {
    super();
    this.state = { travellers: [] };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      listTravellers {
        id name phone bookingTime
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ travellers: data.listTravellers });
    }
  }

  render() {
    const { travellers } = this.state;
    return (
      <div>
        <h3>Travellers List</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Booking Time</th>
            </tr>
          </thead>
          <tbody>
            {travellers.map(traveller => (
              <tr key={traveller.id}>
                <td>{traveller.id}</td>
                <td>{traveller.name}</td>
                <td>{traveller.phone}</td>
                <td>{traveller.bookingTime.toDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class TravellerAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.travellerAdd;
    const ticket = {
      name: form.name.value, phone: parseInt(form.phone.value, 10), bookingTime: new Date()
    };

    const query = `mutation addTraveller($ticket: InputTicket!) {
      addTraveller(ticket: $ticket) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { ticket });
    if (data) {
      alert('Traveller added successfully!');
      form.reset();
      this.props.reloadTravellers();
    }
  }

  render() {
    return (
      <form name="travellerAdd" onSubmit={this.handleSubmit}>
        <input type="text" name="name" placeholder="Name" required />
        <input type="text" name="phone" placeholder="Phone Number" required />
        <button type="submit">Add Traveller</button>
      </form>
    );
  }
}

class TravellerDelete extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.travellerDelete;
    const travellername = form.name.value;

    const query = `mutation deleteTraveller($travellername: String!) {
      deleteTraveller(travellername: $travellername)
    }`;

    const data = await graphQLFetch(query, { travellername });
    if (data && data.deleteTraveller) {
      alert('Traveller deleted successfully!');
      form.reset();
      this.props.reloadTravellers();
    } else {
      alert('Traveller could not be deleted. Please try again.');
    }
  }

  render() {
    return (
      <form name="travellerDelete" onSubmit={this.handleSubmit}>
        <input type="text" name="name" placeholder="Enter Traveller Name to Delete" required />
        <button type="submit">Delete Traveller</button>
      </form>
    );
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.reloadTravellers = this.reloadTravellers.bind(this);
  }

  reloadTravellers() {
    this.travellerList.loadData();
  }

  render() {
    return (
      <div>
        <h1>Ticket To Ride - Travellers Management</h1>
        <TravellerAdd reloadTravellers={this.reloadTravellers} />
        <TravellerDelete reloadTravellers={this.reloadTravellers} />
        <TravellerList ref={instance => { this.travellerList = instance; }} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('contents'));
