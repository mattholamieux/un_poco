// let bgs = ["url(/UNO.jpg)", "url(/DOS.jpeg)", "url(/TRES.JPEG)", "url(/CUATRO.jpg)", "url(/cinco.png)"];
let currentBG = 1;
// document.body.style.backgroundImage = bgs[currentBG];
let font;
let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
let reverbAmount = 0;
let bitWet = 0;
let gainVal = 0.7;
let gainVelocity = 0;
let bufferIndex = 0;
let loopStart, loopEnd;
let pressedPoint = 0;
let releasePoint = 1;
let playIcon, stopIcon, nextIcon, prevIcon;
let isPlaying = false;
let pitchSlider;
let rateSlider;
let grainSlider;
let overlapSlider;
let freqSlider;
let filtDepthSlider;
let bitsSlider;
let reverbSlider;
let volSlider;
let vibratoSlider;
let panDepthSlider;
let waveformData;
let pitches = [-1200, -500, 0, 700, 1200];
let filters = ['lowpass', 'highpass'];
const player = new Tone.GrainPlayer();
let loadingBuffers = true;
const buffers = [];
let filesLoaded = false;
const buffer1 = new Tone.ToneAudioBuffer("../audio/mg_meadow_01.wav", () => {
    console.log("buff1 loaded");
    buffers[0] = buffer1
    player.buffer = buffer1;
    loadingBuffers = false;
    visualizeWaveform(buffer1);
    initialize();
});
let $audio = document.getElementById('myAudio');
let recorder1, recorder2, recDest1, recDest2;
audioRecorder();


const delay = new Tone.PingPongDelay({
    delayTime: 2,
    maxDelay: 4,
    feedback: 0.5,
    wet: 0
})

const filterNode = new Tone.Filter({
    frequency: 10000,
    Q: 5,
    type: "lowpass"
})

// create an autofilter and start it's LFO
const autoFilter = new Tone.AutoFilter(0.1).start();
const autoPanner = new Tone.AutoPanner(0.1).start();

const crusher = new Tone.BitCrusher({
    bits: 16,
    wet: 1
});

const reverb = new Tone.Reverb({
    decay: 6,
    preDelay: 0.25,
    wet: 0
});

const vibrato = new Tone.Vibrato(0.1, 0.5);

const mainGain = new Tone.Gain(gainVal);
const looperGain = new Tone.Gain(0);
const looperPreGain = new Tone.Gain(0);

let signal = new Tone.Signal(0.5);
Tone.Transport.scheduleRepeat(time => {
    signal.setValueAtTime(Math.random() * 2, time);
}, "16n");


function preload() {
    playIcon = loadImage("../icons/Play-icon.png");
    stopIcon = loadImage("../icons/pause.png");
    nextIcon = loadImage('../icons/right2.png');
    prevIcon = loadImage('../icons/left2.png');
    font = loadFont('../font/ViksjoeTrial-Regular.otf');
}


function setup() {
    imageMode(CENTER);
    // sliders
    pitchSlider = document.getElementById('pitch')
    pitchSlider.value = random(pitches)
        // pitchSlider.addEventListener('change', () => {
        //     console.log(map(pitchSlider.value, -1200, 1200, 0, 127));
        //     midiOutput.channels[1].sendControlChange(2, map(pitchSlider.value, -1200, 1200, 0, 127))
        // })
    rateSlider = document.getElementById('rate')
    rateSlider.value = random(0, 4)
    grainSlider = document.getElementById('grain')
    grainSlider.value = random(0, 1);
    overlapSlider = document.getElementById('overlap')
    overlapSlider.value = random(0, 1);
    freqSlider = document.getElementById('freq')
    freqSlider.value = random(0, 4000);
    filtDepthSlider = document.getElementById('filtDepth')
    filtDepthSlider.value = random(0, 1)
    bitsSlider = document.getElementById('bits')
    bitsSlider.value = random(4, 16);
    delayAmtSlider = document.getElementById('delayAmt')
    delayAmtSlider.value = random(0, 1);
    delayTimeSlider = document.getElementById('delayTime')
    delayTimeSlider.value = random(0, 1);
    delayFbackSlider = document.getElementById('delayFback')
    delayFbackSlider.value = random(0, 0.5);
    reverbSlider = document.getElementById('reverb')
    reverbSlider.value = random(0, 1);
    volSlider = document.getElementById('vol')
    volSlider.value = 1;
    vibratoSlider = document.getElementById('vibrato')
    vibratoSlider.value = random(0, 1)
    panDepthSlider = document.getElementById('panDepth')
    panDepthSlider.value = random(0, 1)

    cnv = createCanvas(pitchSlider.clientWidth + 10, 200);
    cnv.parent('canvas-container');
    x1 = 0;
    x2 = width;

}

function draw() {
    // background(255);
    clear();
    rectMode(CENTER);
    stroke(0)
    if (loadingBuffers) {
        noFill();
        strokeWeight(1);
        textAlign(CENTER)
        text("LOADING BUFFERS", width / 2, 100)
    } else {
        noFill();
        strokeWeight(2);
        fill('#5957578c')
            // fill('#fcfcfc75')
        if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < 100) {
            fill('#fcfcfc50')
        }
        rect(width / 2, 50, width, 100, 5)
            // draw play/stop icons
        strokeWeight(4);
        if (!isPlaying) {
            noFill();
            circle(width / 2, 50, 80);
            fill('black')
            triangle(width / 2 - 15, 25, width / 2 + 30, 50, width / 2 - 15, 75)
        } else {
            noFill();
            circle(width / 2, 50, 80);
            fill('black')
            rect(width / 2, 50, 40, 40);
        }
        // draw previous/next icons
        noFill();
        triangle(width / 2 - 75, 25, width / 2 - 115, 50, width / 2 - 75, 75);
        triangle(width / 2 + 75, 25, width / 2 + 115, 50, width / 2 + 75, 75);
        if (mouseIsPressed) {
            if (dist(mouseX, mouseY, (width / 2) - 87.5, 50) < 20) {
                fill(0);
                triangle(width / 2 - 75, 25, width / 2 - 115, 50, width / 2 - 75, 75);
                noFill();
                triangle(width / 2 + 75, 25, width / 2 + 115, 50, width / 2 + 75, 75);
            } else if (dist(mouseX, mouseY, (width / 2) + 87.5, 50) < 20) {
                noFill();
                triangle(width / 2 - 75, 25, width / 2 - 115, 50, width / 2 - 75, 75);
                fill(0);
                triangle(width / 2 + 75, 25, width / 2 + 115, 50, width / 2 + 75, 75);
            }
        }
        // draw waveform
        strokeWeight(2);
        if (waveformData) {
            for (let i = 0; i < waveformData.length; i++) {
                let xPos = i * ((pitchSlider.clientWidth + 10) / 70);
                rect(xPos, 150, 1, map(waveformData[i], 0, 1, 0, 20));
            }
        }
        // draw click & drag box
        if (mouseX > 0 && mouseX < width && mouseY > 113 && mouseY < 190) {
            fill('#fcfcfc50')
        }
        rect(width / 2, 150, width, 75, 5)
        noStroke();
        rectMode(CORNER);
        fill('#5957578c')
            // fill('#fcfcfc75')
        rect(x1, 113, x2 - x1, 75);


        // snap pitch to octaves and fifths
        if (pitchSlider.value > 900) {
            pitchSlider.value = 1200
        } else if (pitchSlider.value > 500) {
            pitchSlider.value = 700;
        } else if (pitchSlider.value > -300) {
            pitchSlider.value = 0;
        } else if (pitchSlider.value > -900) {
            pitchSlider.value = -700;
        } else {
            pitchSlider.value = -1200;
        }
        player.grainSize = grainSlider.value;
        player.overlap = overlapSlider.value;
        player.playbackRate = rateSlider.value;
        player.detune = pitchSlider.value;
        delay.wet.value = delayAmtSlider.value;
        delay.delayTime.rampTo(delayTimeSlider.value, 0.5);
        delay.feedback.value = delayFbackSlider.value;
        reverb.wet.value = reverbSlider.value;
        mainGain.gain.value = volSlider.value;
        autoFilter.baseFrequency = freqSlider.value;
        autoFilter.depth.value = filtDepthSlider.value;
        crusher.bits.value = map(bitsSlider.value, 4, 16, 16, 4);
        vibrato.depth.value = vibratoSlider.value;
        autoPanner.depth.value = panDepthSlider.value;
    }
}

function mousePressed() {
    if (dist(mouseX, mouseY, width / 2, 50) < 20) {
        startStopPlayer();
    } else if (dist(mouseX, mouseY, (width / 2) - 87.5, 50) < 20) {
        console.log('previous');
        changeBuffer('previous');
        currentBG--;
        document.body.style.backgroundImage = bgs[currentBG % bgs.length];
    } else if (dist(mouseX, mouseY, (width / 2) + 87.5, 50) < 20) {
        console.log('next')
        changeBuffer('next');
        currentBG++;
        document.body.style.backgroundImage = bgs[currentBG % bgs.length];
    } else if (mouseX > 0 && mouseX < width && mouseY > 113 && mouseY < 190) {
        getPressedPoint();
    }
}

function mouseReleased() {
    if (mouseX > 0 && mouseX < width && mouseY > 113 && mouseY < 190) {
        getReleasePoint();
    }
}

async function initializeTone() {
    await Tone.start();
    Tone.Transport.start();
}

function startStopPlayer() {
    if (player.state === "stopped") {
        console.log('start player')
        isPlaying = true;
        initializeTone();
        player.sync().start("+0.5", loopStart);
        mainGain.gain.rampTo(1, 1, "+0.5");
    } else {
        console.log('stop player')
        mainGain.gain.rampTo(0, 0.5);
        player.stop("+0.5");
        isPlaying = false;
    }
}


function getPressedPoint() {
    player.playbackRate = 1;
    pressedPoint = map(mouseX, 0, width, 0, 1);
    x1 = mouseX;
    y1 = mouseY;
    console.log(x1);
}

function getReleasePoint() {
    // Capture mouse released x and y
    releasePoint = map(mouseX, 0, width, 0, 1);
    x2 = mouseX;
    y2 = mouseY;
    console.log(x2);
    // Calculate loop start and end points
    calculateLoop();

}

function calculateLoop(midiStart, midiEnd) {
    if (midiStart && midiEnd) {
        loopStart = midiStart * buffers[bufferIndex].duration;;
        loopEnd = midiEnd * buffers[bufferIndex].duration;;
    } else {
        loopStart = pressedPoint * buffers[bufferIndex].duration;
        loopEnd = releasePoint * buffers[bufferIndex].duration;
    }
    console.log(loopStart, loopEnd);
    // Calculate loop start and end points in relation to current buffer's duration
    mainGain.gain.rampTo(0, 1);
    player.stop("+1")
        // If mouse dragged left to right, play forwards
    if (loopStart < loopEnd) {
        player.loopStart = loopStart;
        player.loopEnd = loopEnd;
        player.reverse = false;
        if (player.state === "started") {
            player.sync().start("+1.01", loopStart);
            mainGain.gain.rampTo(1, 1, "+1.01");
        }
    } else { // otherwise, play backwards
        player.loopStart = loopEnd;
        player.loopEnd = loopStart;
        player.reverse = true;
        if (player.state === "started") {
            player.sync().start("+1.01", loopEnd);
            mainGain.gain.rampTo(1, 1, "+1.01");
        }
    }
    // randomizeVals();
}

function randomizeVals() {
    rateSlider.value = random(0.1, 4);
    pitchSlider.value = random(pitches);
    grainSlider.value = random(0.01, 2);
    overlapSlider.value = random(0.01, 2);
    freqSlider.value = random(100, 4000);
    autoFilter.frequency.value = random(0.001, 0.400);
    autoFilter.depth.value = random(0, 1);
    autoFilter.octaves = random(1, 3);
    autoFilter.filter.Q.value = random(5, 15);
    autoPanner.frequency.value = random(0.001, 1);
    autoPanner.depth.value = random(0, 1);
    delayAmtSlider.value = random(0, 1);
    delayTimeSlider.value = random(0, 1);
    delayFbackSlider.value = random(0, 0.5);
    reverbSlider.value = random(0, 1);
    vibratoSlider.value = random(0, 1);
    filtDepthSlider.value = random(0, 1);
    panDepthSlider.value = random(0, 1);
}

function changeBuffer(direction, midi) {
    if (direction === "next") {
        bufferIndex = (bufferIndex + 1) % buffers.length;
        player.buffer = buffers[bufferIndex];
        if (midi) {
            calculateLoop(midiLoopStart, midiLoopEnd);
        } else {
            calculateLoop();
        }
    } else if (direction === 'previous') {
        if (bufferIndex > 0) {
            bufferIndex = (bufferIndex - 1) % buffers.length;
            player.buffer = buffers[bufferIndex];
            if (midi) {
                calculateLoop(midiLoopStart, midiLoopEnd);
            } else {
                calculateLoop();
            }
        } else {
            bufferIndex = buffers.length - 1;
            player.buffer = buffers[bufferIndex];
            if (midi) {
                calculateLoop(midiLoopStart, midiLoopEnd);
            } else {
                calculateLoop();
            }
        }
    }
    visualizeWaveform(buffers[bufferIndex]);
}

function visualizeWaveform(audioBuffer) {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const samples = 70; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    normalizeData(filteredData);
}

function normalizeData(filteredData) {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    waveformData = filteredData.map(n => n * multiplier)
}

function initialize() {
    // Init settings for player and FX
    player.loop = true;
    player.playbackRate = 1;
    autoFilter.filter.Q.value = 10;
    reverb.toDestination();
    player.chain(mainGain, crusher, vibrato, autoFilter, autoPanner, delay, reverb);
    reverb.connect(recDest2);
    // lfo.connect(player.detune);
    signal.connect(vibrato.frequency);
    player.loopStart = 0;
    player.loopEnd = buffers[bufferIndex].duration;
}

let audio_file = document.getElementById('audio_file');
audio_file.onchange = function() {
    if (!filesLoaded) {
        buffers.pop();
        filesLoaded = true;
    }
    for (let i = 0; i < this.files.length; i++) {
        let file = URL.createObjectURL(this.files[i]);
        let buffer = new Tone.ToneAudioBuffer(file, () => {
            buffers.push(buffer);
            console.log('buffer loaded')
            if (i === this.files.length - 1) {
                player.buffer = buffers[0];
                bufferIndex = 0;
                visualizeWaveform(buffers[bufferIndex]);
            }
        });
    }
};

let randoButton = document.getElementById('rando-button');
randoButton.addEventListener("click", () => {
    randomizeVals();
});

let recButton = document.getElementById('rec-button');
let isRecording = false;
recButton.addEventListener("click", () => {
    if (isRecording) {
        recorder2.stop();
        isRecording = false;
        recButton.style.background = 'none'
    } else {
        recorder2.start();
        isRecording = true;
        recButton.style.background = 'rgba(255, 96, 0, 0.33)'
    }
});






function audioRecorder() {
    $audio.style.display = "none"
    const actx = Tone.context;
    recDest1 = actx.createMediaStreamDestination();
    recorder1 = new MediaRecorder(recDest1.stream);
    recDest2 = actx.createMediaStreamDestination();
    recorder2 = new MediaRecorder(recDest2.stream);
    let chunks = [
        [],
        []
    ];
    const recorders = [recorder1, recorder2];

    for (let i = 0; i < recorders.length; i++) {
        recorders[i].onstart = evt => {
            chunks[i] = [];
        };
        recorders[i].ondataavailable = evt => {
            chunks[i].push(evt.data);
        };
        recorders[i].onstop = evt => {
            let blob = new Blob(chunks[i], {
                type: 'audio/ogg; codecs=opus'
            });
            let blobURL = URL.createObjectURL(blob);
            const buffer = new Tone.ToneAudioBuffer();
            buffer.load(blobURL).then(() => {
                make_download(buffer._buffer, buffer._buffer.length, recorders[i])
            });
        };
    }

}

// Functions below adapted from https://russellgood.com/how-to-convert-audiobuffer-to-audio-file/

function make_download(abuffer, total_samples, recorder) {

    // get duration and sample rate
    var duration = abuffer.duration,
        rate = abuffer.sampleRate,
        offset = 0;

    var new_file = URL.createObjectURL(bufferToWave(abuffer, total_samples));
    if (recorder === recorder1) {
        activeLooper.loadTapeLoop(new_file);
    } else {
        $audio.src = new_file;
        $audio.style.display = "block";
    }

}

// Convert an AudioBuffer to a Blob using WAVE representation
function bufferToWave(abuffer, len) {
    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [],
        i, sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) { // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        offset++ // next source sample
    }

    // create Blob
    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}