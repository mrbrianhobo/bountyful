chrome.tabs.onCreated.addListener(function(tab) {
//   // var text = localStorage.getItem('text');
//   // var post = localStorage.getItem('post');
//   // var result = localStorage.getItem('result').split(",");
//   // var text = chrome.storage.sync.get('text',function(res) {
//   //             console.log(res.key)
//   //           });
//   // var post = chrome.storage.sync.get('post',function(res) {
//   //             console.log(res.key)
//   //           });
//   // var result = chrome.storage.sync.get('result',function(res) {
//   //             console.log(res.key)
//   //           });
  chrome.tabs.executeScript(tab.id, {
    file: 'src/background/inject.js'
  });
//   newBounty(text,post,result);
//   newBounty();
//   alert(texts);
//   alert(tab.url);
});

chrome.runtime.onMessage.addListener(function (msg, sender) {
  localStorage.setItem('text', msg.text);
  localStorage.setItem('post', msg.post);
  localStorage.setItem('result', msg.ans);
});

function newBounty() {
  var text = localStorage.getItem('text');
  var post = localStorage.getItem('post');
  var result = localStorage.getItem('result').split(",");
  var title = text;
  var description = post;
  var amt = result[1];
  var email = result[0];
  var time = result[2];
  document.getElementById('contract_title').value = title;
  document.getElementById('contract_description').value = description;
  document.getElementById('fulfillmentAmount').value = amt;
  document.getElementById('contact_info').value = email
  //"yyyy-MM-ddThh:mm"
  document.getElementById('bounty_deadline').value = time;
  // document.getElementById('deposit_amount').value = amt;
  document.getElementsByTagName('button')[0].click();
};

const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

SW.methods.printStorageItems = function() {
  chrome.storage.local.get(null, function(o) {
    console.log(o);
  })
};

SW.methods.saveObject = function(object, callback, objectKey) { // add in bounty?
  var storageObject = {};
  var storageBountyID = {};

  // By default questionId is used for creating objectKey
  if (!objectKey) {
    objectKey = object.objectType + ':' + object.questionId;
  }

  // Will be used at the time of deleting/updating this object
  object['objectKey'] = objectKey;

  // Used to locally save bounties to IDs

  storageObject[objectKey] = object;

  callback = callback || function() {};
  chrome.storage.local.set(storageObject, callback);
};

SW.methods.deleteObject = function(objectKey, callback) {
  callback = callback || function() {};
  chrome.storage.local.remove(objectKey, callback);
};

SW.methods.addObjectToStore = function(object) {
  if (object == null) return;

  var store = SW.maps.ObjectTypeToStoreMap[object.objectType];
  store && store.push(object);
};

SW.methods.removeObjectFromStore = function(objectKey, storeItems) {
  var isObjectRemoved = false;

  for (var i = storeItems.length - 1; i >= 0; i--) {
    if (typeof storeItems[i] == 'object' && storeItems[i]['objectKey'] == objectKey) {
      storeItems.splice(i, 1);
      isObjectRemoved = true;
    }
  }

  return isObjectRemoved;
};

SW.methods.updateStorageArea = function(store) {
  store = store || [];
  store.forEach(function(object) {
    SW.methods.saveObject(object, null, object['objectKey']);
  });
};

/* @deprecated
* Used for version <= 1.3
* Use createStores > 1.3
* TODO: Remove notificationStore and questionFeedStore from localStorage later in 1.4/1.5
* */
SW.methods.loadNotificationStore = function() {
  chrome.storage.local.get('notificationStore', function(items) {
    var notifications = items.notificationStore || [];

    notifications.forEach(function(notification) {
      notification.objectType = SW.OBJECT_TYPES.NEW_ACTIVITY_NOTIFICATION;
      SW.methods.saveObject(notification, function() {
        SW.methods.addObjectToStore(notification);
        SW.methods.updateBadgeText();
      });
    });
  });
};

SW.methods.loadQuestionFeedStore = function() {
  chrome.storage.local.get('questionFeedStore', function(items) {
    var questions = items.questionFeedStore || [];

    questions.forEach(function(question) {
      question.objectType = SW.OBJECT_TYPES.QUESTION;
      SW.methods.saveObject(question, function() {
        SW.methods.addObjectToStore(question);
      });
    });
  });
};

// Will be used after data is migrated
SW.methods.createStores = function() {
  chrome.storage.local.get(null, function(superObject) {
    for (var key in superObject) {
      SW.methods.addObjectToStore(superObject[key]);
      SW.methods.updateBadgeText();
    }

    $(document).trigger('stores:created');
  });
};

SW.methods.getNextFetchDate = function(lastFetchDate, creation_date) {
  var difference = lastFetchDate - creation_date,
    nextFetchInterval = SW.vars.TIME.T_30_MIN;

  if (difference >= SW.vars.TIME.T_5_DAY) {
    nextFetchInterval = SW.vars.TIME.T_10_HOUR;
  } else if (difference >= SW.vars.TIME.T_2_DAY) {
    nextFetchInterval = SW.vars.TIME.T_6_HOUR;
  } else if (difference >= SW.vars.TIME.T_1_DAY) {
    nextFetchInterval = SW.vars.TIME.T_2_HOUR;
  } else if (difference >= SW.vars.TIME.T_5_HOUR) {
    nextFetchInterval = SW.vars.TIME.T_30_MIN;
  } else if (difference >= SW.vars.TIME.T_2_HOUR) {
    nextFetchInterval = SW.vars.TIME.T_10_MIN;
  } else if (difference >= SW.vars.TIME.T_30_MIN) {
    nextFetchInterval = SW.vars.TIME.T_10_MIN;
  } else {
    nextFetchInterval = SW.vars.TIME.T_5_MIN;
  }

  // If app is in debug mode, we always want to fetch notification after 5 minutes
  if (SW.modes.inDebugMode) {
    nextFetchInterval = SW.vars.TIME.T_5_MIN;
  }

  return lastFetchDate + nextFetchInterval;
};

/** Example
 * @param url "http://math.stackexchange.com/questions/521071/combinatorics";
 * url.split('/'); -> ["http:", "", "math.stackexchange.com", "questions", "521071", "combinatorics"]
**/
SW.methods.extractQuestionPageUrlInfo = function(url) {
  var urlData = url.split('/');
  return {
    domain: urlData[2],
    questionId: urlData[4]
  };
};

/** Example
 * @param url (http://stackoverflow.com/users/1231561/user1231561)
 * url.split('/') -> ["http:", "", "stackoverflow.com", "users", "1231561", "user1231561"]
 */
SW.methods.extractProfilePageUrlInfo = function(url) {
  var urlData = url.split('/');

  return {
    domain: urlData[2],
    userId: urlData[4]
  };
};

SW.methods.validateUrl = function(url) {
  // At the moment, we insert content scripts only on question pages
  // So we can assume url is valid
  return true;
};

SW.methods.updateBadgeText = function(changes, areaName) {
  var numNotifications = SW.stores.notificationStore.length + SW.stores.userNotificationStore.length;

  if (numNotifications == 0) {
    numNotifications = '';
  } else if (numNotifications > 99) {
    numNotifications = '99+';
  } else {
    numNotifications = '' + numNotifications;
  }

  chrome.browserAction.setBadgeText({ text: numNotifications });
  chrome.browserAction.setBadgeBackgroundColor({ color: '#333' });
};

SW.methods.sendMessageToContentScript = function(message, options) {
  options = options || {};
  var hashPosition = (options.url ? options.url.indexOf('#') : -1);

  // Remove # if it is present in the URL
  if (hashPosition != -1) {
    options.url = options.url.substr(0, hashPosition);
  }

  chrome.tabs.query(options, function(tabs) {
    $.each(tabs, function(index, tab) {
      chrome.tabs.sendMessage(tab.id, message);
    });
  });
};

SW.methods.sendWatchStatus = function(isPageWatched, url) {
  var message = { messageType: 'watchStatus', watchStatus: isPageWatched };
  
  SW.methods.sendMessageToContentScript(message, {
    url: url /*Send message to all tabs with this URL */
  });
};

SW.methods.sendFollowStatus = function(isUserFollowed, url) {
  var message = { messageType: 'followStatus', followStatus: isUserFollowed };
  SW.methods.sendMessageToContentScript(message, { url: url } );
};

SW.methods.contentScriptCommunicator = function(request, sender, sendResponse) {
  console.log("HENLO AM HERE TOO");
  if (request.event == 'pageLoaded' && request.pageType == 'questionPage') {
    console.log("INFILTRATION");
    SW.methods.clearNotification(request.url);
    SW.methods.isPageBeingWatched(request.url, SW.methods.sendWatchStatus /* callback */);
  }

  if (request.event == 'pageLoaded' && request.pageType == 'profilePage') {
    SW.methods.isUserFollowed(request.url, SW.methods.sendFollowStatus);
  }

  if (request.action == 'watchPage') {
    SW.methods.startWatchingQuestion(request.url, function() {
      SW.methods.sendWatchStatus(true, request.url);
    });
  }

  if (request.action == 'unwatchPage') {
    SW.methods.unwatchQuestion(request.url, SW.methods.sendWatchStatus);
  }

  if (request.action == 'followUser') {
    SW.methods.followUser(request.url, function() {
      SW.methods.sendFollowStatus(true, request.url);
    });
  }

  if (request.action == 'unfollowUser') {
    SW.methods.unfollowUser(request.url, function() {
      SW.methods.sendFollowStatus(false, request.url);
    });
  }
};

SW.methods.doIPFS = function(request, sender, sendResponse) {
    console.log("Hello i am here pls");
    var d = new Date();
    if (request.event == 'needSendTx') {
      console.log("I have made it in");
      var submit = {
      payload: {
        title: "Bounty", // string representing title
        description: "This is our description", // include requirements
        issuer: "ThisIsIssuer", //web3.eth.accounts[0],
          // persona for the issuer of the bounty
          // put the metamask thing in here

        funders: [
          "ThisIsAFunder"//web3.eth.accounts[0]
          //array of personas of those who funded the issue
        ],
        categories: null, // categories of tasks
        created: d.getTime(), //timestamp
        tokenSymbol: "ethereum",//token for which the bounty pays out
        tokenAddress: 0x0// the address for the token which the bounty pays out
      },
      meta: {
        platform: 'stackoverflow',
        schemaVersion: '0.1', 
        schemaName: 'stackoverflowSchema'
      }
      }
      ipfs.addJSON(submit, (err, result)=> {
        if (err) {
          console.log("eror");
        } else {
          console.log("made it into success");
          console.log(result);
          console.log("tx success");
        }
      //   // 0xe5c6bd7dc52b38dd0870224ad32063486a71f9f2
      //   StandardBounties.issueAndActivateBounty(
      //   "ThisIsMyIssuerAddress",//web3.eth.accounts[0], 
      //   answers[1], 
      //   result, 
      //   answers[0], 
      //   0x0, 
      //   true, 
      //   0x0, 
      //   stringValue, 
      //   {from: "web3.eth.accounts[0]", value: answers[0]}, (cerr, succ)=> {
      //   //{from: web3.eth.accounts[0], value: answers[0]}, (cerr, succ)=> {
      //   if (err){
      //     console.log("cerr", err);
      //     this.setState({loadingString: "An error occurred. Please refresh the page and try again."});
      //   } else {
      //     console.log("tx success", succ);
      //   }
      // });
    });
    };
  // need answers
  //doIPFS(answers)

};

SW.methods.init = function() {
  console.log("HALLO I AM HERE"),
  // If data is migrated, then create stores from migrated data
  chrome.storage.local.get('isDataMigrated', function(o) {
    if (o.isDataMigrated) {
      SW.methods.createStores();
    } else {
      SW.methods.loadQuestionFeedStore();
      SW.methods.loadNotificationStore();
      chrome.storage.local.set({'isDataMigrated': true}, null);
    }
  });

  chrome.storage.onChanged.addListener(SW.methods.updateBadgeText);

  // Add Listener for events from content scripts
  chrome.runtime.onMessage.addListener(SW.methods.contentScriptCommunicator);

  //Adding listener for events from ipfs
  chrome.runtime.onMessage.addListener(SW.methods.doIPFS);

  setInterval(SW.methods.fetchNewNotifications, SW.vars.FETCH_NOTIFICATION_INTERVAL);
  setInterval(SW.methods.fetchUserNotifications, SW.vars.USER_NOTIFICATION_FETCH_INTERVAL);
};

SW.methods.init();

// function answerModal() {
//     var link = document.getElementById('submit-button');
//     // onClick's logic below:
//     link.addEventListener('click', function() {
        
//       swal.setDefaults({
//         input: 'text',
//         confirmButtonText: 'Next &rarr;',
//         showCancelButton: true,
//         progressSteps: ['1', '2']
//       })

//       var steps = [
//         'Ans1', //answers[0]
//         'Ans2' //answers[1]
//       ]

//       swal.queue(steps).then((result) => {
//         swal.resetDefaults()

//         if (result.value) {
//           answers = result.value;
//           swal({
//             title: 'All done!',
//             html:
//               'Your answers: <pre>' +
//                 JSON.stringify(result.value) +

//               '</pre>',
//             confirmButtonText: 'Lovely!'
//           })
//         }
//       })    
//   });  
// }
// don't need this anymore, but this is to get data from the DOM not in popup.html and the outside thing
// will update everytime a new tab is changed and execute script can inject js into the html
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   chrome.tabs.executeScript({
//       code: '(' + answerModal + ')();' //argument here is a string but function.toString() returns function's code
//   }, (results, err) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log(results);
//       }
//   });
// }); 
