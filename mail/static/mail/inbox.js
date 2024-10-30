document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").addEventListener('submit', send_email);
  document.querySelector("#contentEmail").addEventListener('click', view_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = ''; 

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#contentEmail').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get request to/emails/mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response.json();
  })
  .then(emails => {
    // loop through the mailbox and create each mailitem
    emails.forEach(email => {
      const emailItem = document.createElement("div");
      emailItem.classList.add("email-item");
      emailItem.classList.add(email.read ? 'read' : 'unread'); //shorthand way of if-else statement

      emailItem.innerHTML = `
    <div class="sender">${email.sender}</div>
    <div class="subject">${email.subject}</div>
    <div class="timestamp">${email.timestamp}</div>
      `;

    // Append the email item to the emails-view container
    document.querySelector('#emails-view').append(emailItem);
    emailItem.addEventListener ('click',() =>  view_email(email.id));
    console.log('Fetching emails for mailbox:', mailbox) 
      
    });
})
.catch(error => {
  console.error('Error loading mailbox:', error);
  // Display an error message or handle the error in some other way
  });
  
}

function send_email(event) {

  event.preventDefault();

  // Retrieve recipients, subject, and body values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

   // Post email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      alert(result.error); // Show error message
    } else {
      alert(`Email sent successfully!`);
      load_mailbox('sent'); // Load the sent mailbox
    }
  })
  .catch(error => {
    console.error('Error sending email:', error);
    alert(`An error occurred while sending the email.`);
  });
}

function view_email(email_id) {

  // Show email's Content and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#contentEmail').style.display = 'block';
  
  fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => { 
  document.querySelector('#email-subject').innerHTML = email.subject;
  document.querySelector('#email-sender').innerHTML = email.sender;
  document.querySelector('#email-recipients').innerHTML = email.recipients;
  document.querySelector('#email-timestamp').innerHTML = email.timestamp;
  document.querySelector('#email-body').innerHTML = email.body;


        })
        
} 

