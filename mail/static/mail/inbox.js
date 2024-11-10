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
    <div class="sender">FROM: ${email.sender}</div>
    <div class="subject">${email.subject}</div>
    <div class="timestamp">${email.timestamp}</div>
      `;

    emailItem.addEventListener ('click',() =>  view_email(email.id));
    console.log(mailbox);

  // Only show the archive/unarchive button for inbox emails
  if (mailbox == 'inbox' || mailbox == 'archive') {
    // Create the archive/unarchive button
    const archiveButton = document.createElement('button');
    archiveButton.textContent = email.archived ? 'Unarchive' : 'Archive';
    archiveButton.addEventListener('click', () =>
      toggleArchive(email.id,email.archived)
    )

    // Append the button to the emailItem
    emailItem.appendChild(archiveButton);
    }
   // Append the email item to the emails-view container
   document.querySelector('#emails-view').append(emailItem);
   });
    });
}


function toggleArchive(emailid,archived){

  fetch(`/emails/${emailid}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !archived
    })
  }).then ( () => {

    const emailItems = document.querySelectorAll('.email-item');
    emailItems.forEach(item => {

        if (item.dataset.emailId == emailid) {
          item.querySelector('button').textContent = email.archived ? 'Unarchive' : 'Archive';
        }
    
  }  )
  // Reload the appropriate mailbox (inbox or archive)
  load_mailbox(archived ? 'inbox' : 'archive');
} )
  
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


  //Whether the email is read or not
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  }).then( () => {
    // Update the email item to reflect the read status
    const emailItems = document.querySelectorAll('.email-item');
    emailItems.forEach(item => {
        if (item.dataset.emailId == email_id) {
            item.classList.remove('unread');
            item.classList.add('read');
        }
  })
        })
        
});
}

