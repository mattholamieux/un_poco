// Enable WebMidi.js and trigger the onEnabled() function when ready
WebMidi
    .enable()
    .then(onEnabled)
    .catch(err => alert(err));


let keysPressed = 0;
let midiLoopStart = 0;
let midiLoopEnd = 1;

// Function triggered when WebMidi.js is ready
function onEnabled() {
    if (WebMidi.inputs.length < 1) {
        document.body.innerHTML += "No device detected.";
    } else {
        populateDeviceList();
    }
    const selectElem = document.getElementById('devices');
    selectElem.addEventListener('change', (event) => {
        // initializeTone();
        midiInput = WebMidi.getInputByName(selectElem.value);
        midiOutput = WebMidi.getOutputByName(selectElem.value);

        midiInput.addListener("controlchange", e => {

            let channel = e.target.number;
            let parameter = e.data[1];
            let value = e.data[2];
            console.log(channel, parameter, value)
            doMidiStuff(channel, parameter, value);

        });

        midiInput.channels[1].addListener("noteon", e => {
            console.log(e.data)
            let note = e.data[1];
            if (note >= 53 && note <= 72) {
                keysPressed++;
                if (keysPressed == 1) {
                    midiLoopStart = map(note, 53, 72, 0, 1);
                    x1 = map(note, 53, 72, 0, width)
                } else if (keysPressed == 2) {
                    midiLoopEnd = map(note, 53, 72, 0, 1);
                    x2 = map(note, 53, 72, 0, width);
                    calculateLoop(midiLoopStart, midiLoopEnd);
                }
            } else if (note == 74) {
                changeBuffer('previous');
            } else if (note == 76) {
                changeBuffer('next');
            } else if (note == 75) {
                startStopPlayer();
            }
        });
        midiInput.channels[1].addListener("noteoff", e => {
            let note = e.data[1];
            if (note >= 53 && note <= 72) {
                keysPressed--;
            }
        });


    })
}

function populateDeviceList() {
    const values = WebMidi.inputs;
    const select = document.createElement("select");
    select.name = "devices";
    select.id = "devices"
    for (const val of values) {
        const device = val.name;
        const option = document.createElement("option");
        option.value = device;
        option.text = device.charAt(0).toUpperCase() + device.slice(1);
        select.appendChild(option);
    }
    var label = document.createElement("label");
    label.htmlFor = "devices";
    document.getElementById("container").appendChild(label).appendChild(select);
}

function doMidiStuff(channel, parameter, value) {
    if (channel === 1) {
        switch (parameter) {
            case 1:
                pitchSlider.value = map(value, 0, 127, -1200, 1200);
                break;
            case 2:
                rateSlider.value = map(value, 0, 127, 0.05, 4);
                break;
            case 3:
                grainSlider.value = map(value, 0, 127, 0.01, 2);
                break;
            case 4:
                overlapSlider.value = map(value, 0, 127, 0.01, 2);
                break;
            case 5:
                freqSlider.value = map(value, 0, 127, 100, 4000);
                break;
            case 6:
                filtDepthSlider.value = map(value, 0, 127, 0, 1);
                break;
            case 7:
                bitsSlider.value = map(value, 0, 127, 4, 16);
                break;
            case 8:
                vibratoSlider.value = map(value, 0, 127, 0, 1);
                break;
            case 9:
                delayAmtSlider.value = map(value, 0, 127, 0, 1);
                break;
            case 10:
                delayTimeSlider.value = map(value, 0, 127, 0, 4);
                break;
            case 11:
                delayFbackSlider.value = map(value, 0, 127, 0, 0.9);
                break;
            case 12:
                reverbSlider.value = map(value, 0, 127, 0, 1);
                break;
            case 13:
                volSlider.value = map(value, 0, 127, 0, 2);
                break;
            case 14:
                panDepthSlider.value = map(value, 0, 127, 0, 1);
                break;
        }
    }
}