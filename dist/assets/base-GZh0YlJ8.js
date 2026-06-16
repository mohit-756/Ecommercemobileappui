<<<<<<<< HEAD:dist/assets/base-PKCB1SCn.js
import{W as a,b as s,C as i,i as o,A as c}from"./index-B8NFTeyi.js";class p extends a{async authenticate(t){try{await this.internalAuthenticate(t)}catch(e){throw e instanceof i&&o(e.code)?new s(e.message,e.code):e}}async addResumeListener(t){return c.addListener("appStateChange",({isActive:e})=>{e&&(async()=>{try{const r=await this.checkBiometry();t(r)}catch(r){console.error(r)}})()})}}export{p as B};
========
import{W as a,b as s,C as i,i as o,A as c}from"./index-Cso2zkbK.js";class p extends a{async authenticate(t){try{await this.internalAuthenticate(t)}catch(e){throw e instanceof i&&o(e.code)?new s(e.message,e.code):e}}async addResumeListener(t){return c.addListener("appStateChange",({isActive:e})=>{e&&(async()=>{try{const r=await this.checkBiometry();t(r)}catch(r){console.error(r)}})()})}}export{p as B};
>>>>>>>> 7943d02 (backup: all current code changes):dist/assets/base-GZh0YlJ8.js
