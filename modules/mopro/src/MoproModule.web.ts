import { EventEmitter } from 'expo-modules-core';
import { Result } from '..';
import { Buffer } from 'buffer';

const emitter = new EventEmitter({} as any);

export default {
  PI: Math.PI,
  async setValueAsync(value: string): Promise<void> {
    emitter.emit('onChange', { value });
  },
  async generateCircomProofWeb(wasmPath: string, zkeyPath: string, circuitInputs: any): Promise<Result> {
    Buffer.from('anything', 'base64');
    window.Buffer = window.Buffer || require("buffer").Buffer;
    const snarkjs = require('snarkjs');

    const url = "https://ci-keys.zkmopro.org"
    const wasmUrl = new URL(wasmPath, url).toString();
    const zkeyUrl = new URL(zkeyPath, url).toString();
    const wasm = await fetch(wasmUrl).then((r) => r.arrayBuffer());
    const zkey = await fetch(zkeyUrl).then((r) => r.arrayBuffer());

    if (typeof process === 'undefined') {
      global.process = { browser: true }; // Define process.browser for the web
    } else if (typeof process.browser === 'undefined') {
      process.browser = true; // Define process.browser if it's not already defined
    }

    const proof = await snarkjs.groth16.fullProve(circuitInputs, new Uint8Array(wasm), new Uint8Array(zkey))
    return {
      proof: proof.proof,
      inputs: proof.publicSignals,
    };
  },
  hello() {
    return 'Hello world! 👋';
  },
};
