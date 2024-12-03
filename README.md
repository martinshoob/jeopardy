# Jeopardy Board

## Installation and Running

You need to run `npm install` in both the `jeopardy/` and `points/` directories, then you can do `node server.js` in both directories to run the jeopardy board and the points board. They are interconnected, but you do not need to run both if you don't need/want to.

## Usage

Define the questions in `jeopardy/json/questions` and the player names (if you want to) in `points/players.json`. You can add audio, video, and images to the questions, but they are optional.

## Images/Videos/Audio

In order to use images/videos/audio you need to create those directories in `jeopardy/public/` and then reference them in the json file (`jeopardy/public/json/questions.json`), it should be pretty straight forward. I left a few examples in the json file.
