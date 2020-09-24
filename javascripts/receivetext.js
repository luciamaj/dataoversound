var TextReceiver = (function() {
    var receivers;
    let playing = false;
    let successes = 0;

    function onReceive(recvPayload, recvObj) {
        //recvObj.content = Quiet.mergeab(recvObj.content, recvPayload);

        recvObj.content = recvPayload;
        calcTime(Quiet.ab2str(recvObj.content));
        recvObj.target.textContent = Quiet.ab2str(recvObj.content);
        recvObj.successes++;
        var total = recvObj.failures + recvObj.successes
        var ratio = recvObj.failures/total * 100;
        recvObj.warningbox.textContent = "You may need to move the transmitter closer to the receiver and set the volume to 50%. Packet Loss: " + recvObj.failures + "/" + total + " (" + ratio.toFixed(0) + "%)";
    };

    let count = 0;
    tempArr = [];

    function calcTime(textRec) {
        console.log("AAAA IL TESTO", textRec);

        if (textRec == 'prod') {
            count = 0;
            tempArr = [];
            tempArr.push(textRec);
            count++;
        } 
        
        if (textRec != 'prod' && count > 0) {
            count++;
            tempArr.push(textRec);
        }

        console.log(tempArr);

        if (tempArr.length == 6 && tempArr[tempArr.length - 1] == "fineP") {
            console.log("array valido");
            let timestamp = tempArr[1] + tempArr[2] + tempArr[3] + tempArr[4];
            console.log("timestamp converted", parseInt(timestamp));
            let timing = parseInt(timestamp);

            if (!playing) {
                let myAudio=document.getElementById('opening');
                console.log("i should be playing", myAudio);
                myAudio.currentTime = timing;
                myAudio.play();
                playing = true;
                successes++;
                document.getElementById('sux').innerHTML = "Successes: " + successes + " Timestamp: " + timing;
                timeoutListening();
            }
        }
    }

    function timeoutListening() {
        setTimeout(function(){ playing = false }, 20000);
    }

    function onReceiverCreateFail(reason, recvObj) {
        console.log("failed to create quiet receiver: " + reason);
        recvObj.warningbox.classList.remove("hidden");
        recvObj.warningbox.textContent = "Sorry, it looks like this example is not supported by your browser. Please give permission to use the microphone or try again in Google Chrome or Microsoft Edge."
    };

    function onReceiveFail(num_fails, recvObj) {
        recvObj.warningbox.classList.remove("hidden");
        recvObj.failures = num_fails;
        var total = recvObj.failures + recvObj.successes
        var ratio = recvObj.failures/total * 100;
        recvObj.warningbox.textContent = "You may need to move the transmitter closer to the receiver and set the volume to 50%. Packet Loss: " + recvObj.failures + "/" + total + " (" + ratio.toFixed(0) + "%)";
    };

    function onClick(e, recvObj) {
        e.target.disabled = true;
        var originalText = e.target.innerText;
        e.target.innerText = e.target.getAttribute('data-quiet-receiving-text');
        e.target.setAttribute('data-quiet-receiving-text', originalText);

        var receiverOnReceive = function(payload) { onReceive(payload, recvObj); };
        var receiverOnReceiverCreateFail = function(reason) { onReceiverCreateFail(reason, recvObj); };
        var receiverOnReceiveFail = function(num_fails) { onReceiveFail(num_fails, recvObj); };
        Quiet.receiver({profile: recvObj.profilename,
            onReceive: receiverOnReceive,
            onCreateFail: receiverOnReceiverCreateFail,
            onReceiveFail: receiverOnReceiveFail
        });

        recvObj.target.classList.remove('hidden');
    }

    function setupReceiver(receiver) {
        var recvObj = {
            profilename: receiver.getAttribute('data-quiet-profile-name'),
            btn: receiver.querySelector('[data-quiet-receive-text-button]'),
            target: receiver.querySelector('[data-quiet-receive-text-target]'),
            warningbox: receiver.querySelector('[data-quiet-receive-text-warning]'),
            successes: 0,
            failures: 0,
            content: new ArrayBuffer(0)
        };
        var onBtnClick = function(e) { return onClick(e, recvObj); };
        recvObj.btn.addEventListener('click', onBtnClick, false);
    };

    function onQuietReady() {
        for (var i = 0; i < receivers.length; i++) {
            setupReceiver(receivers[i]);
        }
    };

    function onQuietFail(reason) {
        console.log("quiet failed to initialize: " + reason);
        var warningbox = document.querySelector('[data-quiet-receive-text-warning]');
        warningbox.classList.remove("hidden");
        warningbox.textContent = "Sorry, it looks like there was a problem with this example (" + reason + ")";
    };

    function onDOMLoad() {
        receivers = document.querySelectorAll('[data-quiet-receive-text]');
        Quiet.addReadyCallback(onQuietReady, onQuietFail);
    };

    document.addEventListener("DOMContentLoaded", onDOMLoad);
})();
