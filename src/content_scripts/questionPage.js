var $QuesIcons = null, $AnsIcons = null, answers;

function sendMessageToBackground(message, callback) {
  chrome.runtime.sendMessage(message, callback);
}

function notifyBackgroundForPageLoad() {
  var url = window.location.href,
    message = { event: 'pageLoaded', url: url, pageType: 'questionPage' };
  sendMessageToBackground(message, function() {});
}

function createIcons() {
  var url = window.location.href,
    $quesTarget, $ansTarget,
    imageUrl = chrome.extension.getURL('resources/logo.png');

  $QuesIcons = $('<img>').attr({ class: 'icon', id: 'QuesIcons', src: imageUrl, title: 'set bounty' })
    .click(function() {

      swal.setDefaults({
        progressSteps: ['1', '2', '3']
      })

      var steps = [{
        input: 'text',
          title: 'Email',
          confirmButtonText: 'Next &rarr;',
          showCancelButton: true,
      },
        {
          input: 'text',
          title: 'Bounty',
          confirmButtonText: 'Next &rarr;',
          showCancelButton: true,
        }, //answers[0]
        {
          input: 'text',
          title: 'Deadline (yyyy-MM-ddThh:mm)',
          confirmButtonText: 'Next &rarr;',
          showCancelButton: true,
        }
         //answers[1]
      ]

      swal.queue(steps).then((result) => {
        swal.resetDefaults()

        if (result.value) {
          answers = result.value;
          // chrome.storage.sync.set({'text': document.getElementsByClassName('question-hyperlink')[0].text,
          //                          'post': document.getElementsByTagName('p')[0].innerHTML,
          //                          'result': result.value});
          var text = document.getElementsByClassName('question-hyperlink')[0].text;
          var post = document.getElementsByTagName('p')[0].innerHTML;
          message = {text : document.getElementsByClassName('question-hyperlink')[0].text, post : document.getElementsByTagName('p')[0].innerHTML, ans: result.value};
          sendMessageToBackground(message, function() {});
          // localStorage.setItem('text', document.getElementsByClassName('question-hyperlink')[0].text);
          // localStorage.setItem('post', document.getElementsByTagName('p')[0].innerHTML);
          // localStorage.setItem('result', result.value);
          swal({
            title: 'All Done!',
            text: 'Your bounty will "bee" posted!',
            type: 'success'
          });
          window.open('https://beta.bounties.network/newBounty/','_newtab');
          // chrome.tabs.create({ windowId: window.id, url: "https://beta.bounties.network/newBounty/" });  
          // window.location = "https://beta.bounties.network/newBounty/";
        }
      }).then(function (result) {
        // if (result.value) {
        //   window.location = "https://beta.bounties.network/newBounty/";
        // }
      })
      var action = $(this).attr('data-action');
      // Update the watch button state ASAP. In case watch/un-watch fails,
      // the same is handled when message is received from background script.
      updateIcons(action == 'watchPage');

      sendMessageToBackground({ action: action, url: url }, function(){ } );
   });

  $AnsIcons = $('<img>').attr({ class: 'icon', id: 'AnsIcons', src: imageUrl, title: 'get bounty' })
    .click(function() {
      swal.setDefaults({
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2']
      })

      var steps = [
        'Bounty ID', //answers[0]
        'Address to send to' //answers[1]
      ]

      swal.queue(steps).then((result) => {
        swal.resetDefaults()

        if (result.value) {
          answers = result.value;
          swal({
            title: 'All done!',
            html:
              'Your answers: <pre>' +
                JSON.stringify(result.value) +

              '</pre>',
            confirmButtonText: 'Lovely!'
          })
        }
      })      
      var action = $(this).attr('data-action');
      // Update the watch button state ASAP. In case watch/un-watch fails,
      // the same is handled when message is received from background script.
      updateIcons(action == 'watchPage');

      sendMessageToBackground({ action: action, url: url }, function(){ } );
   });
  $quesTarget = $('#question').find('div.vote').first();
  $quesTarget.append($QuesIcons);
  $ansTarget = $('#answers').find('form.post-form').first();
  $ansTarget.append($AnsIcons);

}

function updateIcons(watchStatus) {
  var imageUrl,
    action;
  if (!$QuesIcons && !$AnsIcons) {
    createIcons();
  }

  if (watchStatus) {
    imageUrl = chrome.extension.getURL('resources/icons/eye-open/128.png');
    action = 'unwatchPage';
  } else {
    imageUrl = chrome.extension.getURL('resources/logo.png');
    action = 'watchPage';
  }

  $QuesIcons.attr({ src: imageUrl, 'data-action': action });
  $AnsIcons.attr({ src: imageUrl, 'data-action': action });


}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.messageType == 'watchStatus') {
    updateIcons(request.watchStatus);
  } else if (request.messageType == 'notification') {
    showNotification({ type: request.type, message: request.message });
  }
});

$(document).ready(notifyBackgroundForPageLoad);
