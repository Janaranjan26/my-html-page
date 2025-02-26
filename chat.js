const message_notification_audio = new Audio(
  "https://d2b7xl3dqzprnt.cloudfront.net/sounds/message-notification.mp3"
);

let messageLog = [];
let current_client_lang = "Acepta";
let current_agent_lang = "Acepta";
let send_message = "";
let chatStatus = null;
let session;
let baseURL = "https://w0n71c5ydd.execute-api.us-east-1.amazonaws.com/prod/";

const apiGatewayEndpoint =
  "https://9fespdlwjb.execute-api.us-east-1.amazonaws.com/dev/chat-start"; //baseURL + "chatstart";
const transalteApiGateWayEndpoint = baseURL + "translate";
const chatLogApiGateWayEndpoint = baseURL + "chatlog";

// const chatLogApiGateWayEndpoint =
//   baseURL + "chatlog-pg";

const region = "us-east-1";

document.addEventListener("DOMContentLoaded", function () {
  addPreChatBoxModal();
  addWelcomeScreen();
  addChatBoxModal();
  fetchTeamsUserInfo().then(() => {
    // addWelcomeScreen();
    // addChatBoxModal();
  });

  connect.ChatSession.setGlobalConfig({
    region: region,
    features: {
      messageReceipts: {
        shouldSendMessageReceipts: true, // DEFAULT: true, set to false to disable Read/Delivered receipts
        throttleTime: 5000, //default throttle time - time to wait before sending Read/Delivered receipt.
      },
    },
  });

  let sendChatBtn = document.getElementById("sendChat");
  sendChatBtn.onclick = function (e) {
    e.preventDefault();
    sendChat();
    document.getElementById("chatContent").focus();
  };

  let preChatBtn = document.getElementById("preSubmit");

  preChatBtn.onclick = function (e) {
    e.preventDefault();
    const companyName = document.getElementById("companyName").value;
    const clientsFirstName = document.getElementById("clientsFirstName").value;
    const clientsLastName = document.getElementById("clientsLastName").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    // const selectedIssue = document.querySelector(
    //   'input[name="option"]:checked'
    // )?.value;
    const issue=document.getElementById("issue").value;

    // const question = document.getElementById("question").value;

    // -------Validation-------
    let formValid = true;

    // if (!companyName) {
    //   document.getElementById("company-error").innerText =
    //     "Please enter company name.";
    //   formValid = false;
    // }
    if (!clientsFirstName) {
      document.getElementById("clientsFirstName-error").innerText =
        "Please enter your first name.";
      formValid = false;
    }
    if (!clientsLastName) {
      document.getElementById("clientsLastName-error").innerText =
        "Please enter your last name.";
      formValid = false;
    }
    if (!email) {
      document.getElementById("email-error").innerText =
        "Please enter your email.";
      formValid = false;
    }
    // if (!phoneNumber) {
    //   document.getElementById("phoneNumber-error").innerText =
    //     "Please enter your phone number.";
    //   formValid = false;
    // }
    // if (!question) {
    //   document.getElementById("question-error").innerText =
    //     "Please enter your question.";
    //   formValid = false;
    // }
    if(!issue){
      document.getElementById("issue-error").innerText =
        "Please enter Issue Description.";
      formValid = false;
    }

    if (!formValid) return;
    clearErrors();
    // const radioErrorElement = document.getElementById("radio-error");
    // if (!selectedIssue) {
    //   radioErrorElement.innerText = "Please select an issue.";
    //   radioErrorElement.style.color = "red";
    //   return;
    // } else {
    //   radioErrorElement.innerText = "";
    // }

    // ------------------------
    customerName = clientsFirstName;

    payload = {
      InstanceId: "ccb2fb16-a8e4-43f6-948b-a25d35267b38",
      ContactFlowId: "6a63ccd7-f527-42d8-9014-7a22f663c041",
      Attributes: {
        customerName: "Customer",
        CompanyName: companyName,
        ClientsFirstName: clientsFirstName,
        ClientsLastName: clientsLastName,
        PhoneNumber: phoneNumber,
        // Question: question,
        Email: email,
        IssueDescription: issue,
        Source: "Acepta",
      },
    };

    openChatBox(customerName, payload);
    // document.getElementById("chatContent").focus();
  };

  document.getElementById("chatContent").addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
      document.getElementById("chatContent").focus();
    }
  });

  // document.getElementById("companyName").addEventListener("input", function () {
  //   document.getElementById("company-error").innerText = "";
  // });
  document
    .getElementById("clientsFirstName")
    .addEventListener("input", function () {
      document.getElementById("clientsFirstName-error").innerText = "";
    });
  document
    .getElementById("clientsLastName")
    .addEventListener("input", function () {
      document.getElementById("clientsLastName-error").innerText = "";
    });
  document.getElementById("email").addEventListener("input", function () {
    document.getElementById("email-error").innerText = "";
  });
  // document.getElementById("phoneNumber").addEventListener("input", function () {
  //   document.getElementById("phoneNumber-error").innerText = "";
  // });
  // document.getElementById("question").addEventListener("input", function () {
  //   document.getElementById("question-error").innerText = "";
  // });
  document.getElementById("issue").addEventListener("input", function () {
    document.getElementById("issue-error").innerText = "";
  });
  // const radioButtons = document.querySelectorAll('input[name="option"]');
  // radioButtons.forEach((radio) => {
  //   radio.addEventListener("change", function () {
  //     document.getElementById("radio-error").innerText = "";
  //   });
  // });
  function clearErrors() {
    // document.getElementById("company-error").innerText = "";
    document.getElementById("clientsFirstName-error").innerText = "";
    document.getElementById("clientsLastName-error").innerText = "";
    document.getElementById("email-error").innerText = "";
    // document.getElementById("phoneNumber-error").innerText = "";
    // document.getElementById("radio-error").innerText = "";
    document.getElementById("issue-error").innerText = "";
    // document.getElementById("question-error").innerText = "";
  }
  // let endChat = document.getElementById("endChat");
  // endChat.onclick = function (e) {
  //   e.preventDefault();
  //   endChat();
  // };

  // Get the modal
  let welcomeModal = document.getElementById("welcomeModal");
  let modal = document.getElementById("chatModal");

  let preModal = document.getElementById("preChatModal");

  // Get the button that opens the modal
  let btn = document.getElementById("openChatModalBtn");

  // Get the <span> element that closes the modal
  let span = document.getElementsByClassName("chatCloseX")[0];
   let spanBot = document.getElementsByClassName("chatCloseX")[1];
  let spanform = document.getElementsByClassName("chatCloseX")[2];
  let backdrops=document.getElementById("backdrop")
  console.log("span", span, "spanform", spanform);
  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    welcomeModal.style.display = "none";
    backdrops.style.display = "none";
    
    // if (chatStatus) {
    //   endChat();
    // }
  };
  (function(){
    document.getElementById("preChatModal").style.display = "block";
  })()
  spanBot.onclick = function () {
    modal.style.display = "none";
    backdrops.style.display = "none";
    if (chatStatus) {
      endChat();
    }
    document.getElementById("supportForm").reset();
    document.getElementById("preChatModal").style.display = "block";
    
  };
  spanform.onclick = function () {
    preModal.style.display = "none";
    // backdrops.style.display = "none";
    document.getElementById("supportForm").reset();
  };

  // When the user clicks the button, open the modal
  // btn.onclick = function (e) {
  //   e.preventDefault();
  //   // welcomeModal.style.display = "block";
  //   document.getElementById("preChatModal").style.display = "block";
  //   backdrops.style.display = "block";
  //   // preModal.style.display = "block";
  // };

  document.getElementById("chatNowBtn").onclick = function (e) {
    e.preventDefault();
    document.getElementById("welcomeModal").style.display = "none";
    document.getElementById("preChatModal").style.display = "block";
    backdrops.style.display = "block";
  };

  function openChatBox(customerName, payload) {
    messageLog=[]
    //btn.onclick = function (e) {
    preModal.style.display = "none";
    modal.style.display = "block";
    backdrops.style.display = "block";

    // const customerName = customerName;
    //e.preventDefault();

    let chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";
    document.getElementById("chatContent").focus();

    var initiateChatRequest = {
      ParticipantDetails: {
        DisplayName: customerName,
      },
      ...payload,
    };

    fetch(apiGatewayEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(initiateChatRequest),
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success!");
        // console.log(JSON.stringify(result));
        session = connect.ChatSession.create({
          chatDetails: data.data.startChatResult,
          type: "CUSTOMER",
        });

        session.connect().then(
          (response) => {
            // console.log("successful connection: " + JSON.stringify(response));
            chatStatus = "connected";
            return response;
          },
          (error) => {
            // console.log("unsuccessful connection " + JSON.stringify(error));
            return Promise.reject(error);
          }
        );
        session.onConnectionEstablished((data) => {
          console.log("Established!");
        });

        session.onMessage((message) => {
          // console.log("Received message: " + JSON.stringify(message));
          if (message.data.Type == "MESSAGE") {
            if (message.data.Content) {
              console.log(message.data.Content, "hello");
              if (message.data.ParticipantRole == "CUSTOMER") {
                messageLog.push(
                  createChatLogElement(
                    message.data,
                    send_message,
                    message.data.Content
                  )
                );
                appendChatMessage(
                  send_message,
                  message.data.DisplayName,
                  message.data.AbsoluteTime,
                  "msg-send"
                );
              } else {
                translateLanguage(
                  message.data.Content,
                  current_agent_lang,
                  current_client_lang,
                  messageLog[0]?.contactid,
                   "AGENT",
                   message.data.DisplayName
                )
                  .then((response) => response.json())
                  .then((data) => {
                    messageLog.push(
                      createChatLogElement(
                        message.data,
                        data.TranslatedText,
                        message.data.Content
                      )
                    );
                    removeTypringStatus();
                    appendChatMessage(
                      data.TranslatedText,
                      // message.data.DisplayName,
                      "Sovos Support",
                      message.data.AbsoluteTime,
                      "msg-recieve"
                    );
                    message_notification_audio.play();
                  });
              }
            }
          } else if (message.data.Type == "EVENT") {
            console.log("event type:", message.data.ContentType);

            if (
              message.data.ContentType ==
              "application/vnd.amazonaws.connect.event.chat.ended"
              
            ) {
              chatStatus = null;
              removeTypringStatus();
              fetch(chatLogApiGateWayEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  contactid: messageLog[0].contactid,
                  chatLog: messageLog,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  // messageLog = [];
                });
            }

            if (
              message.data.ContentType ==
              "application/vnd.amazonaws.connect.event.participant.left"
            ) {
              // console.log(`${message.data.ParticipantRole} Left`);
              appendEventMessage(
                `${message.data.ParticipantRole} (${message.data.DisplayName}) Left`,
                "event"
              );
              fetch(chatLogApiGateWayEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  contactid: messageLog[0].contactid,
                  chatLog: messageLog,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  // messageLog = [];
                });
            }

            if (
              message.data.ContentType ==
              "application/vnd.amazonaws.connect.event.participant.joined"
            ) {
              if (message.data.ParticipantRole == "AGENT") {
                // console.log(`${message.data.ParticipantRole} Join`);
                appendEventMessage(
                  `${message.data.ParticipantRole} (${message.data.DisplayName}) Join`,
                  "event"
                );
              }
            }
          }
        });

        session.onTyping((typingEvent) => {
          if (typingEvent.data.ParticipantRole === "AGENT") {
            // console.log("Agent is typing... ");
            const onTypingElement = document.querySelectorAll(".ontyping");
            if (onTypingElement.length < 1) {
              appendOnTyping();
            }
          }
        });

        session.onConnectionBroken((data) => {
          console.log("Connection broken.");
        });

        session.onEnded((event) => {
          console.log("Chat End.");
        });
      })
      .catch((error) => {
        console.error(error);
        alert("Try again later.");
      });
  }

  //Customer Event Capture
  const textarea = document.getElementById("chatContent");
  textarea.addEventListener("input", function (event) {
    // This function will be called whenever the user types in the textarea
    // console.log("Typing event captured:", event.target.value);
    const awsSdkResponse = session.sendEvent({
      contentType: "application/vnd.amazonaws.connect.event.typing",
    });
  });
});
function handleHelpOption(option) {
  console.log("option: ", option);
  document.getElementById("chatContent").value = option;
  // appendChatMessage(option, "Sovos Customer", new Date(), "msg-send");
  sendChat();
  // translateLanguage(option, "auto", current_agent_lang)
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log("SendtranslateData:", data);
  //     console.log("option inside", option, "send_message", send_message);
  //     current_client_lang = data.SourceLanguageCode;
  //     session.controller.sendMessage({
  //       message: data.TranslatedText,
  //       contentType: "text/plain",
  //     });
  //   });

  // document.getElementById("chatContent").value = "";
  // document.getElementById("chatContent").focus();
}

function sendChat() {
  send_message = document.getElementById("chatContent").value;
  if (send_message.length <= 0) {
    return;
  }
  

  translateLanguage(send_message, "Acepta", current_agent_lang,messageLog[0]?.contactid,"CUSTOMER", document.getElementById("clientsFirstName").value)
    .then((response) => response.json())
    .then((data) => {
      console.log("SendtranslateData:", data);
      current_client_lang = data.SourceLanguageCode;
      session.controller.sendMessage({
        message: data.TranslatedText,
        contentType: "text/plain",
      });
    });

  document.getElementById("chatContent").value = "";
  document.getElementById("chatContent").focus();
}

function endChat() {
  session.controller.disconnectParticipant();
  fetch(chatLogApiGateWayEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contactid: messageLog[0].contactid,
      chatLog: messageLog,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // messageLog = [];
    });
}

// $("#chatContent").focus();

function appendChatMessage(message, displayName, timeStamp, className) {
  let messageBox = `<div class="messagebox ${className}">
        <div class="message-bubble">
          <div class="message-info">
            <span class="message-info-name">${displayName}</span>
            <span class="message-info-time">${convertTime(timeStamp)}</span>
          </div>
          <div class="message">
            ${linkify(message.replace(/(?<!\\)\n/g, "<br/>"))}
          </div>
        </div>
    </div>`;

  document.getElementById("chatBox").innerHTML += messageBox;
  document.getElementById("chatBox").scrollTop =
    document.getElementById("chatBox").scrollHeight;
}
// const regex=/(https?:\/\/[^\s]+|bit\.ly\/[^\s]+)/g;
function linkify(text) {
  const urlPattern =/(https?:\/\/[^\s]+|bit\.ly\/[^\s]+)/g;
  // /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
// return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');

const formattedData=text.replace(urlPattern,(match)=>{
  return `<a href="https://${match}" target="_blank">${match}</a>`
})
return formattedData
}

function appendEventMessage(message, className) {
  let eventBox = `<div class="eventbox">
                    <div class="${className}">${message}</div>
                  </div>`;
  document.getElementById("chatBox").innerHTML += eventBox;
  document.getElementById("chatBox").scrollTop =
    document.getElementById("chatBox").scrollHeight;
}

function appendOnTyping() {
  let messageBox = `<div class="messagebox ontyping">
                        <div class="message-bubble">
                          <div class="message">
                            <div class="loader"></div>
                          </div>
                        </div>
                    </div>`;
  document.getElementById("chatBox").innerHTML += messageBox;
  document.getElementById("chatBox").scrollTop =
    document.getElementById("chatBox").scrollHeight;
}

function translateLanguage(text, sourcelang, targetlang,contactid,participantrole,displayname) {
  return fetch(transalteApiGateWayEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, sourcelang, targetlang,contactid,participantrole,displayname}),
  });
}

function createChatLogElement(data, customer_content, agent_content) {
  return {
    timestamp: data.AbsoluteTime,
    contactid: data.ContactId,
    displayname: data.DisplayName,
    participantrole: data.ParticipantRole,
    customer_content: customer_content,
    customer_lang_code: current_client_lang,
    agent_content: agent_content,
    agent_lang_code: current_agent_lang,
  };
}

function removeTypringStatus() {
  // Select all elements with the "ontyping" class
  const elementsToRemove = document.querySelectorAll(".ontyping");

  // Iterate over the selected elements and remove them
  elementsToRemove.forEach((element) => {
    element.parentNode.removeChild(element);
  });
}

function convertTime(timestring) {
  const date = new Date(timestring);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const timeString = `${hours}:${minutes}`;

  return timeString;
}

function addWelcomeScreen() {
  document.body.innerHTML += `
    <div id="welcomeModal" class="welcome-screen">
      <div class="modal-content ">
        <div class="modal-header modal-for-welcome">
        <span></span>
          <span class="header-right">
            <span class="chatCloseX">&times;</span>
          </span>
        </div>
        <div id="welcomeBox">
        <!-- Circle and Text -->
        <div class="welcome-gradient">
          <div class="circle">
            <span class="circle-text">Sovos</span>
          </div>
          <div class="welcome-header-text">
            <h3>Welcome to</h3>
            <h3>Acepta</h3>
            <h3>Support Chat!</h3>
            
          </div>
          </div>
          <!-- Button below the text -->
        <div class="button-container">
          <button id="chatNowBtn" class="chat-now-button" >Chat now <i class="bi bi-send"></i></button>
        </div>
        </div>
        </div>
      </div>
    </div>
    `;
}

function addChatBoxModal() {
  document.body.innerHTML += `
  <div id="chatModal" class="chat-modal-container">
      <div class="modal-content">
        <div class="modal-header">
          Sovos Acepta
          <span class="header-right">
            <!--span class="settingGear">&#9965;</span-->
            <span class="chatCloseX">&times;</span>
          </span>
        </div>
        <div id="chatBox"></div>
        <div class="message-inputarea">
          <textarea id="chatContent"  rows="1"  maxrows="3" class="message-input" placeholder = "Enter your message..."></textarea>
          <input id="sendChat" class="message-send-btn" type="button" value="Send" />
        </div>
      </div>
    </div>
  `;
}

// function fetchTeamsUserInfo() {
//     return microsoftTeams.app.initialize().then(() => {
//         console.log("Teams SDK Initialized");

//         return microsoftTeams.app.getContext();
//     }).then((context) => {
//         console.log("Teams Context:", context);
//         if (context.user) {
//             const fullName = context.user.displayName || "";
//             const [firstName, ...lastNameParts] = fullName.split(" ");
//             const lastName = lastNameParts.join(" ");

//             window.teamsUserFirstName = firstName || "";
//             window.teamsUserLastName = lastName || "";

//             console.log("User First Name:", window.teamsUserFirstName);
//             console.log("User Last Name:", window.teamsUserLastName);

//             // If modal is already loaded, update fields
//             if (document.getElementById("clientsFirstName")) {
//                 document.getElementById("clientsFirstName").value = window.teamsUserFirstName;
//                 document.getElementById("clientsLastName").value = window.teamsUserLastName;
//             }
//         } else {
//             console.warn("No user info available in context.");
//         }
//     }).catch(error => {
//         console.error("Error fetching Teams user context:", error);
//     });
// }

// function fetchTeamsUserInfo() {
//     return microsoftTeams.app.initialize().then(() => {
//         console.log("Teams SDK Initialized");

//         return microsoftTeams.app.getContext();
//     }).then((context) => {
//         console.log("Teams Context:", context);
//         if (context.user.loginHint) {
//           console.log("User's Email: ", context.user.userPrincipalName);
//           document.getElementById("email").value = context.user.loginHint;
//         }
//     }).catch(error => {
//         console.error("Error fetching Teams user context:", error);
//     });
// }

function fetchTeamsUserInfo() {
  return new Promise((resolve, reject) => {
    microsoftTeams.app.initialize().then(() => {
      console.log("Teams SDK Initialized");

      return microsoftTeams.app.getContext();
    }).then((context) => {
      console.log("Teams Context:", context);
      sendDataToDjango();
      // console.log("User ID: ", context.user.id)
      // userId = context.user.id
      // userEmail = "jane_smith@example.com"
      userEmail = context.user.loginHint
      // if (context.user.displayName) {
      //   console.log("User Name: ", context.user.displayName);
      // } else {
      //   console.log("Display Name is missing. Trying alternative...");
      //   fetchUserName(userEmail, userId);
      // }
      if (context.user.loginHint) {
        console.log("User's Email: ", context.user.loginHint);
        // Extract first and last name from email
        const nameParts = userEmail.split('@')[0].split(/[\._]/); // Splitting by . or _
        let firstName = nameParts[0] || "";
        let lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        // Save to global scope (optional)
        window.teamsUserFirstName = firstName;
        window.teamsUserLastName = lastName;

        console.log("Extracted First Name:", firstName);
        console.log("Extracted Last Name:", lastName);
        // Wait until the DOM is fully available before manipulating it
        const emailField = document.getElementById("email");
        const firstNameField = document.getElementById("clientsFirstName");
        const lastNameField = document.getElementById("clientsLastName");

        if (emailField) emailField.value = userEmail;
        if (firstNameField) firstNameField.value = firstName;
        if (lastNameField) lastNameField.value = lastName;
        
        // if (emailField) {
        //   emailField.value = context.user.loginHint;
        // } else {
        //   console.error("Email field not found");
        // }
      }
      resolve();
    }).catch((error) => {
      console.error("Error fetching Teams user context:", error);
      reject(error);
    });
  });
}

async function sendDataToDjango() {
    const inputData = { input: "Hello, Django!" };

    const response = await fetch("http://127.0.0.1:8000/api/process/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData)
    });

    const result = await response.json();
    console.log("Output form Django:", result.message);
}

// async function fetchUserName(email, userId) {
//     let teamsAPIUrl = `https://graph.microsoft.com/v1.0/users/${userId}`;
//     console.log("Teams API URL: ", teamsAPIUrl)

//     fetch(teamsAPIUrl, {
//         method: "GET",
//         headers: {
//             "Accept": "application/json",
//             "Authorization": `Bearer ${getAuthToken()}` 
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Fetched Display Name: ", data.displayName);
//     })
//     .catch(error => {
//         console.error("Error fetching display name: ", error);
//     });
// }

// function getAuthToken() {
//     console.log("Inside getAuthToken")
//     return new Promise((resolve, reject) => {
//         microsoftTeams.authentication.getAuthToken({
//             successCallback: (token) => resolve(token),
//             failureCallback: (error) => reject(error)
//         });
//     });
// }

function addPreChatBoxModal() {
  document.body.innerHTML += `
  <div id="preChatModal" class="chat-modal-container">
      <div class="modal-content">
          <div class="modal-header">
             <span></span>
            <span class="header-right">
              <!--span class="settingGear">&#9965;</span-->
             
            </span>
          </div>
        
      <form id="supportForm" class="chat-form" onsubmit="return validateForm()">
       <div class="mont" style="background-color:#1689ce;padding:15px 0;color:white;font-weight:bold;text-align:center;">SOS Internation Chat</div>
          <div class="row" style="display:flex;justify-content:space-around;margin-top:40px">
      <div class="form-group" class="col-sm-4">
        <label for="company">Company: </label>
        <input type="text" class="form-input" id="companyName" name="companyName" required>
         <div id="company-error" class="error-message"></div>
        </div>
       <div class="form-group" class="col-sm-4">
        <label for="clientsFirstName">First Name:  <span class="required">*</span></label>
        <input type="text" class="form-input" id="clientsFirstName" name="clientsFirstName" required>
         <div id="clientsFirstName-error" class="error-message"></div>
        </div>
        <div class="form-group" class="col-sm-4">
        <label for="clientsLastName">Last Name:  <span class="required">*</span></label>
        <input type="text" class="form-input" id="clientsLastName" name="clientsLastName" required>
        <div id="clientsLastName-error" class="error-message"></div>
        </div>
        </div>
         <div class="row" style="display:flex;justify-content:space-around">
      
        <div class="form-group" class="col-sm-4">
          <label for="email">Email:  <span class="required">*</span></label>
            <input type="email" id="email" class="form-input" name="email" required>
            <div id="email-error" class="error-message"></div>
        </div>
        <div class="form-group">
          <label for="phoneNumber">Phone Number:  </label>
          <input  type="tel"  class="form-input"  id="phoneNumber" name="phoneNumber"  required
          >
          <div id="phoneNumber-error" class="error-message"></div>
        </div>
          <div class="form-group">
        <label class="labeldata" for="issue">How can we help you today?: <span class="required">*</span></label>
        <textarea id="issue" class="form-input" name="issue" rows="2" required></textarea>
         <div id="issue-error" class="error-message"></div>
        </div> 
        </div>
        
        <div class="sendBtn">
        <input id="preSubmit" class="start-chat-btn" type="button" value="Submit" />
        </div>
    </form>

     
    </div>
  `;
//   setTimeout(() => {
//     if (document.getElementById("clientsFirstName")) {
//         document.getElementById("clientsFirstName").value = window.teamsUserFirstName || "";
//         document.getElementById("clientsLastName").value = window.teamsUserLastName || "";
//     }
// }, 2000);
}
