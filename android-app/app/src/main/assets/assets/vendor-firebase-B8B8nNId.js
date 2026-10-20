import{o as wy,R as vc}from"./vendor-utils-BXPL24B5.js";const vy=()=>{};var td={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tp=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Ay=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],u=n[t++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|u&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},np={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,u=o?n[s+1]:0,c=s+2<n.length,l=c?n[s+2]:0,f=i>>2,p=(i&3)<<4|u>>4;let g=(u&15)<<2|l>>6,A=l&63;c||(A=64,o||(g=64)),r.push(t[f],t[p],t[g],t[A])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(tp(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Ay(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],u=s<n.length?t[n.charAt(s)]:0;++s;const l=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||u==null||l==null||p==null)throw new Ry;const g=i<<2|u>>4;if(r.push(g),l!==64){const A=u<<4&240|l>>2;if(r.push(A),p!==64){const S=l<<6&192|p;r.push(S)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Ry extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Py=function(n){const e=tp(n);return np.encodeByteArray(e,!0)},Ho=function(n){return Py(n).replace(/\./g,"")},rp=function(n){try{return np.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sp(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const by=()=>sp().__FIREBASE_DEFAULTS__,Sy=()=>{if(typeof process>"u"||typeof td>"u")return;const n=td.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Vy=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&rp(n[1]);return e&&JSON.parse(e)},Ta=()=>{try{return vy()||by()||Sy()||Vy()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},ip=n=>{var e,t;return(t=(e=Ta())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},op=n=>{const e=ip(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},ap=()=>{var n;return(n=Ta())==null?void 0:n.config},up=n=>{var e;return(e=Ta())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cp{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lp(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Ho(JSON.stringify(t)),Ho(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Re(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Cy(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Re())}function hp(){var e;const n=(e=Ta())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function xy(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Ny(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function ky(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Dy(){const n=Re();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function dp(){return!hp()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function fp(){return!hp()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function pp(){try{return typeof indexedDB=="object"}catch{return!1}}function Oy(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ly="FirebaseError";class Ot extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Ly,Object.setPrototypeOf(this,Ot.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ci.prototype.create)}}class Ci{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?My(i,r):"Error",u=`${this.serviceName}: ${o} (${s}).`;return new Ot(s,u,r)}}function My(n,e){try{let t=0,r="";for(;t<n.length;){const s=n.indexOf("{$",t);if(s===-1){r+=n.substring(t);break}const i=n.indexOf("}",s+2);if(i===-1){r+=n.substring(t);break}const o=n.substring(s+2,i),u=e[o];r+=n.substring(t,s)+(u!=null?String(u):`<${o}?>`),t=i+1}return r}catch{return n}}function Uy(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function hr(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(nd(i)&&nd(o)){if(!hr(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function nd(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xi(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function $s(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function js(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Fy(n,e){const t=new By(n,e);return t.subscribe.bind(t)}class By{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");qy(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Pu),s.error===void 0&&(s.error=Pu),s.complete===void 0&&(s.complete=Pu);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function qy(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Pu(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vr(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Ac(n){return(await fetch(n,{credentials:"include"})).ok}class An{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $y{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new cp;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(zy(e))try{this.getOrInitializeService({instanceIdentifier:zn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=zn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=zn){return this.instances.has(e)}getOptions(e=zn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(i);r===u&&o.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:jy(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=zn){return this.component?this.component.multipleInstances?e:zn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function jy(n){return n===zn?void 0:n}function zy(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gy{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new $y(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var te;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(te||(te={}));const Hy={debug:te.DEBUG,verbose:te.VERBOSE,info:te.INFO,warn:te.WARN,error:te.ERROR,silent:te.SILENT},Ky=te.INFO,Wy={[te.DEBUG]:"log",[te.VERBOSE]:"log",[te.INFO]:"info",[te.WARN]:"warn",[te.ERROR]:"error"},Qy=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Wy[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Rc{constructor(e){this.name=e,this._logLevel=Ky,this._logHandler=Qy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in te))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Hy[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,te.DEBUG,...e),this._logHandler(this,te.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,te.VERBOSE,...e),this._logHandler(this,te.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,te.INFO,...e),this._logHandler(this,te.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,te.WARN,...e),this._logHandler(this,te.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,te.ERROR,...e),this._logHandler(this,te.ERROR,...e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yy{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Xy(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Xy(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const $u="@firebase/app",rd="0.16.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $t=new Rc("@firebase/app"),Jy="@firebase/app-compat",Zy="@firebase/analytics-compat",eI="@firebase/analytics",tI="@firebase/app-check-compat",nI="@firebase/app-check",rI="@firebase/auth",sI="@firebase/auth-compat",iI="@firebase/database",oI="@firebase/data-connect",aI="@firebase/database-compat",uI="@firebase/functions",cI="@firebase/functions-compat",lI="@firebase/installations",hI="@firebase/installations-compat",dI="@firebase/messaging",fI="@firebase/messaging-compat",pI="@firebase/performance",mI="@firebase/performance-compat",gI="@firebase/remote-config",_I="@firebase/remote-config-compat",yI="@firebase/storage",II="@firebase/storage-compat",TI="@firebase/firestore",EI="@firebase/ai",wI="@firebase/firestore-compat",vI="firebase",AI="12.19.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ju="[DEFAULT]",RI={[$u]:"fire-core",[Jy]:"fire-core-compat",[eI]:"fire-analytics",[Zy]:"fire-analytics-compat",[nI]:"fire-app-check",[tI]:"fire-app-check-compat",[rI]:"fire-auth",[sI]:"fire-auth-compat",[iI]:"fire-rtdb",[oI]:"fire-data-connect",[aI]:"fire-rtdb-compat",[uI]:"fire-fn",[cI]:"fire-fn-compat",[lI]:"fire-iid",[hI]:"fire-iid-compat",[dI]:"fire-fcm",[fI]:"fire-fcm-compat",[pI]:"fire-perf",[mI]:"fire-perf-compat",[gI]:"fire-rc",[_I]:"fire-rc-compat",[yI]:"fire-gcs",[II]:"fire-gcs-compat",[TI]:"fire-fst",[wI]:"fire-fst-compat",[EI]:"fire-vertex","fire-js":"fire-js",[vI]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ui=new Map,PI=new Map,zu=new Map;function sd(n,e){try{n.container.addComponent(e)}catch(t){$t.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function dr(n){const e=n.name;if(zu.has(e))return $t.debug(`There were multiple attempts to register component ${e}.`),!1;zu.set(e,n);for(const t of ui.values())sd(t,n);for(const t of PI.values())sd(t,n);return!0}function Ea(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Qe(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bI={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Lt=new Ci("app","Firebase",bI);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SI{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new An("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Lt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ar=AI;function VI(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:ju,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw Lt.create("bad-app-name",{appName:String(s)});if(t||(t=ap()),!t)throw Lt.create("no-options");const i=ui.get(s);if(i)if(hr(t,i.options)){if(hr(r,i.config))return i;throw Lt.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(r)})}else throw Lt.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const o=new Gy(s);for(const c of zu.values())o.addComponent(c);const u=new SI(t,r,o);return ui.set(s,u),u}function Pc(n=ju){const e=ui.get(n);if(!e&&n===ju&&ap())return VI();if(!e)throw Lt.create("no-app",{appName:n});return e}function RS(){return Array.from(ui.values())}function bt(n,e,t){let r=RI[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${r}" with version "${e}":`];s&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),$t.warn(o.join(" "));return}dr(new An(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CI="firebase-heartbeat-database",xI=1,ci="firebase-heartbeat-store";let bu=null;function mp(){return bu||(bu=wy(CI,xI,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(ci)}catch(t){console.warn(t)}}}}).catch(n=>{throw Lt.create("idb-open",{originalErrorMessage:n.message})})),bu}async function NI(n){try{const t=(await mp()).transaction(ci),r=await t.objectStore(ci).get(gp(n));return await t.done,r}catch(e){if(e instanceof Ot)$t.warn(e.message);else{const t=Lt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});$t.warn(t.message)}}}async function id(n,e){try{const r=(await mp()).transaction(ci,"readwrite");await r.objectStore(ci).put(e,gp(n)),await r.done}catch(t){if(t instanceof Ot)$t.warn(t.message);else{const r=Lt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});$t.warn(r.message)}}}function gp(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kI=1024,DI=30;class OI{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new MI(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=od();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>DI){const o=UI(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){$t.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=od(),{heartbeatsToSend:r,unsentEntries:s}=LI(this._heartbeatsCache.heartbeats),i=Ho(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return $t.warn(t),""}}}function od(){return new Date().toISOString().substring(0,10)}function LI(n,e=kI){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),ad(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),ad(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class MI{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return pp()?Oy().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await NI(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return id(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return id(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function ad(n){return Ho(JSON.stringify({version:2,heartbeats:n})).length}function UI(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FI(n){dr(new An("platform-logger",e=>new Yy(e),"PRIVATE")),dr(new An("heartbeat",e=>new OI(e),"PRIVATE")),bt($u,rd,n),bt($u,rd,"esm2020"),bt("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */FI("");var BI="firebase",qI="12.19.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */bt(BI,qI,"app");function _p(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const $I=_p,yp=new Ci("auth","Firebase",_p());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ko=new Rc("@firebase/auth");function Vo(n,...e){Ko.logLevel<=te.WARN&&Ko.warn(`Auth (${Ar}): ${n}`,...e)}function Co(n,...e){Ko.logLevel<=te.ERROR&&Ko.error(`Auth (${Ar}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dt(n,...e){throw bc(n,...e)}function _t(n,...e){return bc(n,...e)}function wa(n,e,t){const r={...$I(),[e]:t};return new Ci("auth","Firebase",r).create(e,{appName:n.name})}function Ft(n){return wa(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function jI(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&dt(n,"argument-error"),wa(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function bc(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return yp.create(n,...e)}function H(n,e,...t){if(!n)throw bc(e,...t)}function Mt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Co(e),new Error(e)}function jt(n,e){n||Mt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gu(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function zI(){return ud()==="http:"||ud()==="https:"}function ud(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(zI()||Ny()||"connection"in navigator)?navigator.onLine:!0}function HI(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ni{constructor(e,t){this.shortDelay=e,this.longDelay=t,jt(t>e,"Short delay should be less than long delay!"),this.isMobile=Cy()||ky()}get(){return GI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sc(n,e){jt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ip{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Mt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Mt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Mt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WI=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],QI=new Ni(3e4,6e4);function kn(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Dn(n,e,t,r,s={}){return Tp(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const u=xi({...o,key:n.config.apiKey}).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const l={method:e,headers:c,...i};return xy()||(l.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&vr(n.emulatorConfig.host)&&(l.credentials="include"),Ip.fetch()(await Ep(n,n.config.apiHost,t,u),l)})}async function Tp(n,e,t){n._canInitEmulator=!1;const r={...KI,...e};try{const s=new XI(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw _o(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const u=i.ok?o.errorMessage:o.error.message,[c,l]=u.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw _o(n,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw _o(n,"email-already-in-use",o);if(c==="USER_DISABLED")throw _o(n,"user-disabled",o);const f=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw wa(n,f,l);dt(n,f)}}catch(s){if(s instanceof Ot)throw s;dt(n,"network-request-failed",{message:String(s)})}}async function ki(n,e,t,r,s={}){const i=await Dn(n,e,t,r,s);return"mfaPendingCredential"in i&&dt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function Ep(n,e,t,r){const s=`${e}${t}?${r}`,i=n,o=i.config.emulator?Sc(n.config,s):`${n.config.apiScheme}://${s}`;return WI.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function YI(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class XI{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(_t(this.auth,"network-request-failed")),QI.get())})}}function _o(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=_t(n,e,r);return s.customData._tokenResponse=t,s}function cd(n){return n!==void 0&&n.enterprise!==void 0}class JI{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return YI(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function ZI(n,e){return Dn(n,"GET","/v2/recaptchaConfig",kn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eT(n,e){return Dn(n,"POST","/v1/accounts:delete",e)}async function Wo(n,e){return Dn(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qs(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function tT(n,e=!1){const t=de(n),r=await t.getIdToken(e),s=Vc(r);H(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Qs(Su(s.auth_time)),issuedAtTime:Qs(Su(s.iat)),expirationTime:Qs(Su(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Su(n){return Number(n)*1e3}function Vc(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Co("JWT malformed, contained fewer than 3 sections"),null;try{const s=rp(t);return s?JSON.parse(s):(Co("Failed to decode base64 JWT payload"),null)}catch(s){return Co("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function ld(n){const e=Vc(n);return H(e,"internal-error"),H(typeof e.exp<"u","internal-error"),H(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function li(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Ot&&nT(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function nT({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rT{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hu{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Qs(this.lastLoginAt),this.creationTime=Qs(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qo(n){var p;const e=n.auth,t=await n.getIdToken(),r=await li(n,Wo(e,{idToken:t}));H(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(p=s.providerUserInfo)!=null&&p.length?wp(s.providerUserInfo):[],o=iT(n.providerData,i),u=n.isAnonymous,c=!(n.email&&s.passwordHash)&&!(o!=null&&o.length),l=u?c:!1,f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Hu(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(n,f)}async function sT(n){const e=de(n);await Qo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function iT(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function wp(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oT(n,e){const t=await Tp(n,{},async()=>{const r=xi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=await Ep(n,s,"/v1/token",`key=${i}`),u=await n._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:u,body:r};return n.emulatorConfig&&vr(n.emulatorConfig.host)&&(c.credentials="include"),Ip.fetch()(o,c)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function aT(n,e){return Dn(n,"POST","/v2/accounts:revokeToken",kn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){H(e.idToken,"internal-error"),H(typeof e.idToken<"u","internal-error"),H(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):ld(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){H(e.length!==0,"internal-error");const t=ld(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(H(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await oT(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new Wr;return r&&(H(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(H(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(H(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Wr,this.toJSON())}_performRefresh(){return Mt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sn(n,e){H(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class gt{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new rT(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Hu(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await li(this,this.stsTokenManager.getToken(this.auth,e));return H(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return tT(this,e)}reload(){return sT(this)}_assign(e){this!==e&&(H(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new gt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){H(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Qo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Qe(this.auth.app))return Promise.reject(Ft(this.auth));const e=await this.getIdToken();return await li(this,eT(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,u=t.tenantId??void 0,c=t._redirectEventId??void 0,l=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:p,emailVerified:g,isAnonymous:A,providerData:S,stsTokenManager:D}=t;H(p&&D,e,"internal-error");const N=Wr.fromJSON(this.name,D);H(typeof p=="string",e,"internal-error"),sn(r,e.name),sn(s,e.name),H(typeof g=="boolean",e,"internal-error"),H(typeof A=="boolean",e,"internal-error"),sn(i,e.name),sn(o,e.name),sn(u,e.name),sn(c,e.name),sn(l,e.name),sn(f,e.name);const $=new gt({uid:p,auth:e,email:s,emailVerified:g,displayName:r,isAnonymous:A,photoURL:o,phoneNumber:i,tenantId:u,stsTokenManager:N,createdAt:l,lastLoginAt:f});return S&&Array.isArray(S)&&($.providerData=S.map(j=>({...j}))),c&&($._redirectEventId=c),$}static async _fromIdTokenResponse(e,t,r=!1){const s=new Wr;s.updateFromServerResponse(t);const i=new gt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Qo(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];H(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?wp(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),u=new Wr;u.updateFromIdToken(r);const c=new gt({uid:s.localId,auth:e,stsTokenManager:u,isAnonymous:o}),l={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Hu(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,l),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hd=new Map;function Ut(n){jt(n instanceof Function,"Expected a class definition");let e=hd.get(n);return e?(jt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,hd.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vp{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}vp.type="NONE";const dd=vp;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xo(n,e,t){return`firebase:${n}:${e}:${t}`}class tr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=xo(this.userKey,s.apiKey,i),this.fullPersistenceKey=xo("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Wo(this.auth,{idToken:e}).catch(()=>{});return t?gt._fromGetAccountInfoResponse(this.auth,t,e):null}return gt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,r="authUser"){if(!t.length)return new tr(Ut(dd),e,r);const s=(await Promise.all(t.map(async l=>{try{if(await l._isAvailable())return l}catch{return}}))).filter(l=>l);let i=s[0]||Ut(dd);const o=xo(r,e.config.apiKey,e.name);let u=null;for(const l of t)try{const f=await l._get(o);if(f){let p;if(typeof f=="string"){const g=await Wo(e,{idToken:f}).catch(()=>{});if(!g)break;p=await gt._fromGetAccountInfoResponse(e,g,f)}else p=gt._fromJSON(e,f);l!==i&&(u=p),i=l;break}}catch{}const c=s.filter(l=>l._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new tr(i,e,r):(i=c[0],u&&await i._set(o,u.toJSON()),await Promise.all(t.map(async l=>{if(l!==i)try{await l._remove(o)}catch{}})),new tr(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fd(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(bp(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Ap(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Vp(e))return"Blackberry";if(Cp(e))return"Webos";if(Rp(e))return"Safari";if((e.includes("chrome/")||Pp(e))&&!e.includes("edge/"))return"Chrome";if(Sp(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Ap(n=Re()){return/firefox\//i.test(n)}function Rp(n=Re()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Pp(n=Re()){return/crios\//i.test(n)}function bp(n=Re()){return/iemobile/i.test(n)}function Sp(n=Re()){return/android/i.test(n)}function Vp(n=Re()){return/blackberry/i.test(n)}function Cp(n=Re()){return/webos/i.test(n)}function Cc(n=Re()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function uT(n=Re()){var e;return Cc(n)&&!!((e=window.navigator)!=null&&e.standalone)}function cT(){return Dy()&&document.documentMode===10}function xp(n=Re()){return Cc(n)||Sp(n)||Cp(n)||Vp(n)||/windows phone/i.test(n)||bp(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Np(n,e=[]){let t;switch(n){case"Browser":t=fd(Re());break;case"Worker":t=`${fd(Re())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Ar}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lT{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,u)=>{try{const c=e(i);o(c)}catch(c){u(c)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hT(n,e={}){return Dn(n,"GET","/v2/passwordPolicy",kn(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dT=6;class fT{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??dT,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pT{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new pd(this),this.idTokenSubscription=new pd(this),this.beforeStateQueue=new lT(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=yp,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ut(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted){try{this.persistenceManager=await tr.create(this,e)}catch(o){Vo(`Failed to initialize persistence: ${o}`),this.persistenceManager=await tr.create(this,[])}finally{(r=this._resolvePersistenceManagerAvailable)==null||r.call(this)}if(!this._deleted){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(t)}catch(o){Vo(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Wo(this,{idToken:e}),r=await gt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Qe(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(u,u))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,u=r==null?void 0:r._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===u)&&(c!=null&&c.user)&&(r=c.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return H(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Qo(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=HI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Qe(this.app))return Promise.reject(Ft(this));const t=e?de(e):null;return t&&H(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&H(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Qe(this.app)?Promise.reject(Ft(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Qe(this.app)?Promise.reject(Ft(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ut(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await hT(this),t=new fT(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ci("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await aT(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Ut(e)||this._popupRedirectResolver;H(t,this,"argument-error"),this.redirectPersistenceManager=await tr.create(this,[Ut(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(H(u,this,"internal-error"),u.then(()=>{o||i(this.currentUser)}).catch(c=>{if(!o)if(typeof t!="function"&&t.error)t.error(c);else if(r)r(c);else throw c}),typeof t=="function"){const c=e.addObserver(t,r,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(t){const r=(t==null?void 0:t.message)||String(t),s=wa(this,"internal-error",`An internal AuthError has occurred: ${r}`);throw s.customData={originalError:t},s}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return H(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Np(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(Qe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&Vo(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function On(n){return de(n)}class pd{constructor(e){this.auth=e,this.observer=null,this.addObserver=Fy(t=>this.observer=t)}get next(){return H(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let va={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function mT(n){va=n}function kp(n){return va.loadJS(n)}function gT(){return va.recaptchaEnterpriseScript}function _T(){return va.gapiScript}function yT(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class IT{constructor(){this.enterprise=new TT}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class TT{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ET="recaptcha-enterprise",Dp="NO_RECAPTCHA",md="onFirebaseAuthREInstanceReady";class ln{constructor(e){this.type=ET,this.auth=On(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,u)=>{ZI(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{const l=new JI(c);return i.tenantId==null?i._agentRecaptchaConfig=l:i._tenantRecaptchaConfigs[i.tenantId]=l,o(l.siteKey)}}).catch(c=>{u(c)})})}function s(i,o,u){const c=window.grecaptcha;cd(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(l=>{o(l)}).catch(()=>{o(Dp)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new IT().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{r(this.auth).then(async u=>{if(!t&&cd(window.grecaptcha)&&ln.scriptInjectionDeferred)await ln.scriptInjectionDeferred.promise,s(u,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=gT();c.length!==0&&(c+=u+`&onload=${md}`),ln.scriptInjectionDeferred=new cp,window[md]=()=>{var l;(l=ln.scriptInjectionDeferred)==null||l.resolve()},kp(c).then(()=>{var l;return(l=ln.scriptInjectionDeferred)==null?void 0:l.promise}).then(()=>{s(u,i,o)}).catch(l=>{o(l)})}}).catch(u=>{o(u)})})}}ln.scriptInjectionDeferred=null;async function gd(n,e,t,r=!1,s=!1){const i=new ln(n);let o;if(s)o=Dp;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const u={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){const c=u.phoneEnrollmentInfo.phoneNumber,l=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){const c=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return r?Object.assign(u,{captchaResp:o}):Object.assign(u,{captchaResponse:o}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function Ku(n,e,t,r,s){var i;if((i=n._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await gd(n,e,t,t==="getOobCode");return r(n,o)}else return r(n,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const u=await gd(n,e,t,t==="getOobCode");return r(n,u)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wT(n,e){const t=Ea(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(hr(i,e??{}))return s;dt(s,"already-initialized")}return t.initialize({options:e})}function vT(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Ut);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function AT(n,e,t){const r=On(n);H(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=Op(e),{host:o,port:u}=RT(e),c=u===null?"":`:${u}`,l={url:`${i}//${o}${c}/`},f=Object.freeze({host:o,port:u,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){H(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),H(hr(l,r.config.emulator)&&hr(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=l,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,vr(o)?Ac(`${i}//${o}${c}`):PT()}function Op(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function RT(n){const e=Op(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:_d(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:_d(o)}}}function _d(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function PT(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xc{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Mt("not implemented")}_getIdTokenResponse(e){return Mt("not implemented")}_linkToIdToken(e,t){return Mt("not implemented")}_getReauthenticationResolver(e){return Mt("not implemented")}}async function bT(n,e){return Dn(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ST(n,e){return ki(n,"POST","/v1/accounts:signInWithPassword",kn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function VT(n,e){return ki(n,"POST","/v1/accounts:signInWithEmailLink",kn(n,e))}async function CT(n,e){return ki(n,"POST","/v1/accounts:signInWithEmailLink",kn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi extends xc{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new hi(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new hi(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ku(e,t,"signInWithPassword",ST);case"emailLink":return VT(e,{email:this._email,oobCode:this._password});default:dt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Ku(e,r,"signUpPassword",bT);case"emailLink":return CT(e,{idToken:t,email:this._email,oobCode:this._password});default:dt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qr(n,e){return ki(n,"POST","/v1/accounts:signInWithIdp",kn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xT="http://localhost";class fr extends xc{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new fr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):dt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const o=new fr(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Qr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Qr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Qr(e,t)}buildRequest(){const e={requestUri:xT,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=xi(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NT(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function kT(n){const e=$s(js(n)).link,t=e?$s(js(e)).deep_link_id:null,r=$s(js(n)).deep_link_id;return(r?$s(js(r)).link:null)||r||t||e||n}class Nc{constructor(e){const t=$s(js(e)),r=t.apiKey??null,s=t.oobCode??null,i=NT(t.mode??null);H(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=kT(e);try{return new Nc(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs{constructor(){this.providerId=hs.PROVIDER_ID}static credential(e,t){return hi._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Nc.parseLink(t);return H(r,"argument-error"),hi._fromEmailAndCode(e,r.code,r.tenantId)}}hs.PROVIDER_ID="password";hs.EMAIL_PASSWORD_SIGN_IN_METHOD="password";hs.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kc{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Di extends kc{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hn extends Di{constructor(){super("facebook.com")}static credential(e){return fr._fromParams({providerId:hn.PROVIDER_ID,signInMethod:hn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return hn.credentialFromTaggedObject(e)}static credentialFromError(e){return hn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return hn.credential(e.oauthAccessToken)}catch{return null}}}hn.FACEBOOK_SIGN_IN_METHOD="facebook.com";hn.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dn extends Di{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return fr._fromParams({providerId:dn.PROVIDER_ID,signInMethod:dn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return dn.credentialFromTaggedObject(e)}static credentialFromError(e){return dn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return dn.credential(t,r)}catch{return null}}}dn.GOOGLE_SIGN_IN_METHOD="google.com";dn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fn extends Di{constructor(){super("github.com")}static credential(e){return fr._fromParams({providerId:fn.PROVIDER_ID,signInMethod:fn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return fn.credentialFromTaggedObject(e)}static credentialFromError(e){return fn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return fn.credential(e.oauthAccessToken)}catch{return null}}}fn.GITHUB_SIGN_IN_METHOD="github.com";fn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pn extends Di{constructor(){super("twitter.com")}static credential(e,t){return fr._fromParams({providerId:pn.PROVIDER_ID,signInMethod:pn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return pn.credentialFromTaggedObject(e)}static credentialFromError(e){return pn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return pn.credential(t,r)}catch{return null}}}pn.TWITTER_SIGN_IN_METHOD="twitter.com";pn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function DT(n,e){return ki(n,"POST","/v1/accounts:signUp",kn(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pr{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await gt._fromIdTokenResponse(e,r,s),o=yd(r);return new pr({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=yd(r);return new pr({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function yd(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yo extends Ot{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Yo.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Yo(e,t,r,s)}}function Lp(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Yo._fromErrorAndOperation(n,i,e,r):i})}async function OT(n,e,t=!1){const r=await li(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return pr._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function LT(n,e,t=!1){const{auth:r}=n;if(Qe(r.app))return Promise.reject(Ft(r));const s="reauthenticate";try{const i=await li(n,Lp(r,s,e,n),t);H(i.idToken,r,"internal-error");const o=Vc(i.idToken);H(o,r,"internal-error");const{sub:u}=o;return H(n.uid===u,r,"user-mismatch"),pr._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&dt(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mp(n,e,t=!1){if(Qe(n.app))return Promise.reject(Ft(n));const r="signIn",s=await Lp(n,r,e),i=await pr._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function MT(n,e){return Mp(On(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Up(n){const e=On(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function PS(n,e,t){if(Qe(n.app))return Promise.reject(Ft(n));const r=On(n),o=await Ku(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",DT).catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&Up(n),c}),u=await pr._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(u.user),u}function bS(n,e,t){return Qe(n.app)?Promise.reject(Ft(n)):MT(de(n),hs.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Up(n),r})}function UT(n,e,t,r){return de(n).onIdTokenChanged(e,t,r)}function FT(n,e,t){return de(n).beforeAuthStateChanged(e,t)}function SS(n){return de(n).signOut()}const Xo="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Xo,"1"),this.storage.removeItem(Xo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BT=1e3,qT=10;class Bp extends Fp{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=xp(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,u,c)=>{this.notifyListeners(o,c)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);cT()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,qT):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},BT)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Bp.type="LOCAL";const $T=Bp;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qp extends Fp{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}qp.type="SESSION";const $p=qp;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jT(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aa{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Aa(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const u=Array.from(o).map(async l=>l(t.origin,i)),c=await jT(u);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Aa.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dc(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zT{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((u,c)=>{const l=Dc("",20);s.port1.start();const f=setTimeout(()=>{c(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(p){const g=p;if(g.data.eventId===l)switch(g.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),u(g.data.response);break;default:clearTimeout(f),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function St(){return window}function GT(n){St().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jp(){return typeof St().WorkerGlobalScope<"u"&&typeof St().importScripts=="function"}async function HT(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function KT(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function WT(){return jp()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zp="firebaseLocalStorageDb",QT=1,Jo="firebaseLocalStorage",Gp="fbase_key";class Oi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Ra(n,e){return n.transaction([Jo],e?"readwrite":"readonly").objectStore(Jo)}function YT(){const n=indexedDB.deleteDatabase(zp);return new Oi(n).toPromise()}function Hp(){const n=indexedDB.open(zp,QT);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Jo,{keyPath:Gp})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Jo)?e(r):(r.close(),await YT(),e(await Hp()))})})}async function Id(n,e,t){const r=Ra(n,!0).put({[Gp]:e,value:t});return new Oi(r).toPromise()}async function XT(n,e){const t=Ra(n,!1).get(e),r=await new Oi(t).toPromise();return r===void 0?null:r.value}function Td(n,e){const t=Ra(n,!0).delete(e);return new Oi(t).toPromise()}const JT=800,ZT=3;class Kp{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Hp(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>ZT)throw r;if(this.dbPromise){const s=this.dbPromise;this.dbPromise=null;try{(await s).close()}catch{}}}}async initializeServiceWorkerMessaging(){return jp()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Aa._getInstance(WT()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await HT(),!this.activeServiceWorker)return;this.sender=new zT(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||KT()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Id(e,Xo,"1"),await Td(e,Xo)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Id(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>XT(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Td(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const i=Ra(s,!1).getAll();return new Oi(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||Vo(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),JT)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Kp.type="LOCAL";const eE=Kp;new Ni(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wp(n,e){return e?Ut(e):(H(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oc extends xc{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Qr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Qr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Qr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function tE(n){return Mp(n.auth,new Oc(n),n.bypassAuthState)}function nE(n){const{auth:e,user:t}=n;return H(t,e,"internal-error"),LT(t,new Oc(n),n.bypassAuthState)}async function rE(n){const{auth:e,user:t}=n;return H(t,e,"internal-error"),OT(t,new Oc(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qp{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:u}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return tE;case"linkViaPopup":case"linkViaRedirect":return rE;case"reauthViaPopup":case"reauthViaRedirect":return nE;default:dt(this.auth,"internal-error")}}resolve(e){jt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){jt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sE=new Ni(2e3,1e4);async function VS(n,e,t){if(Qe(n.app))return Promise.reject(_t(n,"operation-not-supported-in-this-environment"));const r=On(n);jI(n,e,kc);const s=Wp(r,t);return new Jn(r,"signInViaPopup",e,s).executeNotNull()}class Jn extends Qp{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Jn.currentPopupAction&&Jn.currentPopupAction.cancel(),Jn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return H(e,this.auth,"internal-error"),e}async onExecution(){jt(this.filter.length===1,"Popup operations only handle one event");const e=Dc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(_t(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(_t(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Jn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(_t(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,sE.get())};e()}}Jn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iE="pendingRedirect",No=new Map;class oE extends Qp{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=No.get(this.auth._key());if(!e){try{const r=await aE(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}No.set(this.auth._key(),e)}return this.bypassAuthState||No.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function aE(n,e){const t=lE(e),r=cE(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function uE(n,e){No.set(n._key(),e)}function cE(n){return Ut(n._redirectPersistence)}function lE(n){return xo(iE,n.config.apiKey,n.name)}async function hE(n,e,t=!1){if(Qe(n.app))return Promise.reject(Ft(n));const r=On(n),s=Wp(r,e),o=await new oE(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dE=600*1e3;class fE{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!pE(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Yp(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(_t(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=dE&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ed(e))}saveEventToCache(e){this.cachedEventUids.add(Ed(e)),this.lastProcessedEventTime=Date.now()}}function Ed(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Yp({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function pE(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Yp(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mE(n,e={}){return Dn(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gE=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,_E=/^https?/;async function yE(n){if(n.config.emulator)return;const{authorizedDomains:e}=await mE(n);for(const t of e)try{if(IE(t))return}catch{}dt(n,"unauthorized-domain")}function IE(n){const e=Gu(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!_E.test(t))return!1;if(gE.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TE=new Ni(3e4,6e4);function wd(){const n=St().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function EE(n){return new Promise((e,t)=>{var s,i,o;function r(){wd(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{wd(),t(_t(n,"network-request-failed"))},timeout:TE.get()})}if((i=(s=St().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=St().gapi)!=null&&o.load)r();else{const u=yT("iframefcb");return St()[u]=()=>{gapi.load?r():t(_t(n,"network-request-failed"))},kp(`${_T()}?onload=${u}`).catch(c=>t(c))}}).catch(e=>{throw ko=null,e})}let ko=null;function wE(n){return ko=ko||EE(n),ko}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vE=new Ni(5e3,15e3),AE="__/auth/iframe",RE="emulator/auth/iframe",PE={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},bE=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function SE(n){const e=n.config;H(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Sc(e,RE):`https://${n.config.authDomain}/${AE}`,r={apiKey:e.apiKey,appName:n.name,v:Ar},s=bE.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${xi(r).slice(1)}`}async function VE(n){const e=await wE(n),t=St().gapi;return H(t,n,"internal-error"),e.open({where:document.body,url:SE(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:PE,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=_t(n,"network-request-failed"),u=St().setTimeout(()=>{i(o)},vE.get());function c(){St().clearTimeout(u),s(r)}r.ping(c).then(c,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CE={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},xE=500,NE=600,kE="_blank",DE="http://localhost";class vd{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function OE(n,e,t,r=xE,s=NE){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let u="";const c={...CE,width:r.toString(),height:s.toString(),top:i,left:o},l=Re().toLowerCase();t&&(u=Pp(l)?kE:t),Ap(l)&&(e=e||DE,c.scrollbars="yes");const f=Object.entries(c).reduce((g,[A,S])=>`${g}${A}=${S},`,"");if(uT(l)&&u!=="_self")return LE(e||"",u),new vd(null);const p=window.open(e||"",u,f);H(p,n,"popup-blocked");try{p.focus()}catch{}return new vd(p)}function LE(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ME="__/auth/handler",UE="emulator/auth/handler",FE=encodeURIComponent("fac");async function Ad(n,e,t,r,s,i){H(n.config.authDomain,n,"auth-domain-config-required"),H(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Ar,eventId:s};if(e instanceof kc){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Uy(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof Di){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}n.tenantId&&(o.tid=n.tenantId);const u=o;for(const f of Object.keys(u))u[f]===void 0&&delete u[f];const c=await n._getAppCheckToken(),l=c?`#${FE}=${encodeURIComponent(c)}`:"";return`${BE(n)}?${xi(u).slice(1)}${l}`}function BE({config:n}){return n.emulator?Sc(n,UE):`https://${n.authDomain}/${ME}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vu="webStorageSupport";class qE{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=$p,this._completeRedirectFn=hE,this._overrideRedirectResult=uE}async _openPopup(e,t,r,s){var o;jt((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await Ad(e,t,r,Gu(),s);return OE(e,i,Dc())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await Ad(e,t,r,Gu(),s);return GT(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(jt(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await VE(e),r=new fE(e);return t.register("authEvent",s=>(H(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Vu,{type:Vu},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[Vu];i!==void 0&&t(!!i),dt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=yE(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return xp()||Rp()||Cc()}}const $E=qE;var Rd="@firebase/auth",Pd="1.13.6";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jE{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){H(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zE(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function GE(n){dr(new An("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:u}=r.options;H(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:u,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Np(n)},l=new pT(r,s,i,c);return vT(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),dr(new An("auth-internal",e=>{const t=On(e.getProvider("auth").getImmediate());return(r=>new jE(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),bt(Rd,Pd,zE(n)),bt(Rd,Pd,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HE=300,KE=up("authIdTokenMaxAge")||HE;let bd=null;const WE=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>KE)return;const s=t==null?void 0:t.token;bd!==s&&(bd=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function CS(n=Pc()){const e=Ea(n,"auth");if(e.isInitialized())return e.getImmediate();const t=wT(n,{popupRedirectResolver:$E,persistence:[eE,$T,$p]}),r=up("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=WE(i.toString());FT(t,o,()=>o(t.currentUser)),UT(t,u=>o(u))}}const s=ip("auth");return s&&AT(t,`http://${s}`),t}function QE(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}mT({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=_t("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",QE().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});GE("Browser");var Sd=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var In,Xp;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,_){function I(){}I.prototype=_.prototype,T.F=_.prototype,T.prototype=new I,T.prototype.constructor=T,T.D=function(v,w,b){for(var y=Array(arguments.length-2),Ke=2;Ke<arguments.length;Ke++)y[Ke-2]=arguments[Ke];return _.prototype[w].apply(v,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,_,I){I||(I=0);const v=Array(16);if(typeof _=="string")for(var w=0;w<16;++w)v[w]=_.charCodeAt(I++)|_.charCodeAt(I++)<<8|_.charCodeAt(I++)<<16|_.charCodeAt(I++)<<24;else for(w=0;w<16;++w)v[w]=_[I++]|_[I++]<<8|_[I++]<<16|_[I++]<<24;_=T.g[0],I=T.g[1],w=T.g[2];let b=T.g[3],y;y=_+(b^I&(w^b))+v[0]+3614090360&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[1]+3905402710&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[2]+606105819&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[3]+3250441966&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(b^I&(w^b))+v[4]+4118548399&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[5]+1200080426&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[6]+2821735955&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[7]+4249261313&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(b^I&(w^b))+v[8]+1770035416&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[9]+2336552879&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[10]+4294925233&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[11]+2304563134&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(b^I&(w^b))+v[12]+1804603682&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[13]+4254626195&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[14]+2792965006&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[15]+1236535329&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(w^b&(I^w))+v[1]+4129170786&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[6]+3225465664&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[11]+643717713&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[0]+3921069994&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^b&(I^w))+v[5]+3593408605&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[10]+38016083&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[15]+3634488961&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[4]+3889429448&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^b&(I^w))+v[9]+568446438&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[14]+3275163606&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[3]+4107603335&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[8]+1163531501&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^b&(I^w))+v[13]+2850285829&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[2]+4243563512&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[7]+1735328473&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[12]+2368359562&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(I^w^b)+v[5]+4294588738&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[8]+2272392833&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[11]+1839030562&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[14]+4259657740&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^b)+v[1]+2763975236&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[4]+1272893353&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[7]+4139469664&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[10]+3200236656&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^b)+v[13]+681279174&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[0]+3936430074&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[3]+3572445317&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[6]+76029189&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^b)+v[9]+3654602809&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[12]+3873151461&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[15]+530742520&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[2]+3299628645&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(w^(I|~b))+v[0]+4096336452&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[7]+1126891415&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[14]+2878612391&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[5]+4237533241&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~b))+v[12]+1700485571&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[3]+2399980690&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[10]+4293915773&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[1]+2240044497&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~b))+v[8]+1873313359&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[15]+4264355552&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[6]+2734768916&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[13]+1309151649&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~b))+v[4]+4149444226&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[11]+3174756917&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[2]+718787259&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[9]+3951481745&4294967295,T.g[0]=T.g[0]+_&4294967295,T.g[1]=T.g[1]+(w+(y<<21&4294967295|y>>>11))&4294967295,T.g[2]=T.g[2]+w&4294967295,T.g[3]=T.g[3]+b&4294967295}r.prototype.v=function(T,_){_===void 0&&(_=T.length);const I=_-this.blockSize,v=this.C;let w=this.h,b=0;for(;b<_;){if(w==0)for(;b<=I;)s(this,T,b),b+=this.blockSize;if(typeof T=="string"){for(;b<_;)if(v[w++]=T.charCodeAt(b++),w==this.blockSize){s(this,v),w=0;break}}else for(;b<_;)if(v[w++]=T[b++],w==this.blockSize){s(this,v),w=0;break}}this.h=w,this.o+=_},r.prototype.A=function(){var T=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);T[0]=128;for(var _=1;_<T.length-8;++_)T[_]=0;_=this.o*8;for(var I=T.length-8;I<T.length;++I)T[I]=_&255,_/=256;for(this.v(T),T=Array(16),_=0,I=0;I<4;++I)for(let v=0;v<32;v+=8)T[_++]=this.g[I]>>>v&255;return T};function i(T,_){var I=u;return Object.prototype.hasOwnProperty.call(I,T)?I[T]:I[T]=_(T)}function o(T,_){this.h=_;const I=[];let v=!0;for(let w=T.length-1;w>=0;w--){const b=T[w]|0;v&&b==_||(I[w]=b,v=!1)}this.g=I}var u={};function c(T){return-128<=T&&T<128?i(T,function(_){return new o([_|0],_<0?-1:0)}):new o([T|0],T<0?-1:0)}function l(T){if(isNaN(T)||!isFinite(T))return p;if(T<0)return N(l(-T));const _=[];let I=1;for(let v=0;T>=I;v++)_[v]=T/I|0,I*=4294967296;return new o(_,0)}function f(T,_){if(T.length==0)throw Error("number format error: empty string");if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(T.charAt(0)=="-")return N(f(T.substring(1),_));if(T.indexOf("-")>=0)throw Error('number format error: interior "-" character');const I=l(Math.pow(_,8));let v=p;for(let b=0;b<T.length;b+=8){var w=Math.min(8,T.length-b);const y=parseInt(T.substring(b,b+w),_);w<8?(w=l(Math.pow(_,w)),v=v.j(w).add(l(y))):(v=v.j(I),v=v.add(l(y)))}return v}var p=c(0),g=c(1),A=c(16777216);n=o.prototype,n.m=function(){if(D(this))return-N(this).m();let T=0,_=1;for(let I=0;I<this.g.length;I++){const v=this.i(I);T+=(v>=0?v:4294967296+v)*_,_*=4294967296}return T},n.toString=function(T){if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(S(this))return"0";if(D(this))return"-"+N(this).toString(T);const _=l(Math.pow(T,6));var I=this;let v="";for(;;){const w=Q(I,_).g;I=$(I,w.j(_));let b=((I.g.length>0?I.g[0]:I.h)>>>0).toString(T);if(I=w,S(I))return b+v;for(;b.length<6;)b="0"+b;v=b+v}},n.i=function(T){return T<0?0:T<this.g.length?this.g[T]:this.h};function S(T){if(T.h!=0)return!1;for(let _=0;_<T.g.length;_++)if(T.g[_]!=0)return!1;return!0}function D(T){return T.h==-1}n.l=function(T){return T=$(this,T),D(T)?-1:S(T)?0:1};function N(T){const _=T.g.length,I=[];for(let v=0;v<_;v++)I[v]=~T.g[v];return new o(I,~T.h).add(g)}n.abs=function(){return D(this)?N(this):this},n.add=function(T){const _=Math.max(this.g.length,T.g.length),I=[];let v=0;for(let w=0;w<=_;w++){let b=v+(this.i(w)&65535)+(T.i(w)&65535),y=(b>>>16)+(this.i(w)>>>16)+(T.i(w)>>>16);v=y>>>16,b&=65535,y&=65535,I[w]=y<<16|b}return new o(I,I[I.length-1]&-2147483648?-1:0)};function $(T,_){return T.add(N(_))}n.j=function(T){if(S(this)||S(T))return p;if(D(this))return D(T)?N(this).j(N(T)):N(N(this).j(T));if(D(T))return N(this.j(N(T)));if(this.l(A)<0&&T.l(A)<0)return l(this.m()*T.m());const _=this.g.length+T.g.length,I=[];for(var v=0;v<2*_;v++)I[v]=0;for(v=0;v<this.g.length;v++)for(let w=0;w<T.g.length;w++){const b=this.i(v)>>>16,y=this.i(v)&65535,Ke=T.i(w)>>>16,Un=T.i(w)&65535;I[2*v+2*w]+=y*Un,j(I,2*v+2*w),I[2*v+2*w+1]+=b*Un,j(I,2*v+2*w+1),I[2*v+2*w+1]+=y*Ke,j(I,2*v+2*w+1),I[2*v+2*w+2]+=b*Ke,j(I,2*v+2*w+2)}for(T=0;T<_;T++)I[T]=I[2*T+1]<<16|I[2*T];for(T=_;T<2*_;T++)I[T]=0;return new o(I,0)};function j(T,_){for(;(T[_]&65535)!=T[_];)T[_+1]+=T[_]>>>16,T[_]&=65535,_++}function q(T,_){this.g=T,this.h=_}function Q(T,_){if(S(_))throw Error("division by zero");if(S(T))return new q(p,p);if(D(T))return _=Q(N(T),_),new q(N(_.g),N(_.h));if(D(_))return _=Q(T,N(_)),new q(N(_.g),_.h);if(T.g.length>30){if(D(T)||D(_))throw Error("slowDivide_ only works with positive integers.");for(var I=g,v=_;v.l(T)<=0;)I=X(I),v=X(v);var w=Z(I,1),b=Z(v,1);for(v=Z(v,2),I=Z(I,2);!S(v);){var y=b.add(v);y.l(T)<=0&&(w=w.add(I),b=y),v=Z(v,1),I=Z(I,1)}return _=$(T,w.j(_)),new q(w,_)}for(w=p;T.l(_)>=0;){for(I=Math.max(1,Math.floor(T.m()/_.m())),v=Math.ceil(Math.log(I)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),b=l(I),y=b.j(_);D(y)||y.l(T)>0;)I-=v,b=l(I),y=b.j(_);S(b)&&(b=g),w=w.add(b),T=$(T,y)}return new q(w,T)}n.B=function(T){return Q(this,T).h},n.and=function(T){const _=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<_;v++)I[v]=this.i(v)&T.i(v);return new o(I,this.h&T.h)},n.or=function(T){const _=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<_;v++)I[v]=this.i(v)|T.i(v);return new o(I,this.h|T.h)},n.xor=function(T){const _=Math.max(this.g.length,T.g.length),I=[];for(let v=0;v<_;v++)I[v]=this.i(v)^T.i(v);return new o(I,this.h^T.h)};function X(T){const _=T.g.length+1,I=[];for(let v=0;v<_;v++)I[v]=T.i(v)<<1|T.i(v-1)>>>31;return new o(I,T.h)}function Z(T,_){const I=_>>5;_%=32;const v=T.g.length-I,w=[];for(let b=0;b<v;b++)w[b]=_>0?T.i(b+I)>>>_|T.i(b+I+1)<<32-_:T.i(b+I);return new o(w,T.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,Xp=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=l,o.fromString=f,In=o}).apply(typeof Sd<"u"?Sd:typeof self<"u"?self:typeof window<"u"?window:{});var yo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Jp,zs,Zp,Do,Wu,em,tm,nm;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof yo=="object"&&yo];for(var h=0;h<a.length;++h){var d=a[h];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function s(a,h){if(h)e:{var d=r;a=a.split(".");for(var m=0;m<a.length-1;m++){var P=a[m];if(!(P in d))break e;d=d[P]}a=a[a.length-1],m=d[a],h=h(m),h!=m&&h!=null&&e(d,a,{configurable:!0,writable:!0,value:h})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(h){var d=[],m;for(m in h)Object.prototype.hasOwnProperty.call(h,m)&&d.push([m,h[m]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function u(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function c(a,h,d){return a.call.apply(a.bind,arguments)}function l(a,h,d){return l=c,l.apply(null,arguments)}function f(a,h){var d=Array.prototype.slice.call(arguments,1);return function(){var m=d.slice();return m.push.apply(m,arguments),a.apply(this,m)}}function p(a,h){function d(){}d.prototype=h.prototype,a.Z=h.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(m,P,V){for(var U=Array(arguments.length-2),J=2;J<arguments.length;J++)U[J-2]=arguments[J];return h.prototype[P].apply(m,U)}}var g=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function A(a){const h=a.length;if(h>0){const d=Array(h);for(let m=0;m<h;m++)d[m]=a[m];return d}return[]}function S(a,h){for(let m=1;m<arguments.length;m++){const P=arguments[m];var d=typeof P;if(d=d!="object"?d:P?Array.isArray(P)?"array":d:"null",d=="array"||d=="object"&&typeof P.length=="number"){d=a.length||0;const V=P.length||0;a.length=d+V;for(let U=0;U<V;U++)a[d+U]=P[U]}else a.push(P)}}class D{constructor(h,d){this.i=h,this.j=d,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function N(a){o.setTimeout(()=>{throw a},0)}function $(){var a=T;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class j{constructor(){this.h=this.g=null}add(h,d){const m=q.get();m.set(h,d),this.h?this.h.next=m:this.g=m,this.h=m}}var q=new D(()=>new Q,a=>a.reset());class Q{constructor(){this.next=this.g=this.h=null}set(h,d){this.h=h,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let X,Z=!1,T=new j,_=()=>{const a=Promise.resolve(void 0);X=()=>{a.then(I)}};function I(){for(var a;a=$();){try{a.h.call(a.g)}catch(d){N(d)}var h=q;h.j(a),h.h<100&&(h.h++,a.next=h.g,h.g=a)}Z=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var b=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,h),o.removeEventListener("test",d,h)}catch{}return a})();function y(a){return/^[\s\xa0]*$/.test(a)}function Ke(a,h){w.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,h)}p(Ke,w),Ke.prototype.init=function(a,h){const d=this.type=a.type,m=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget,h||(d=="mouseover"?h=a.fromElement:d=="mouseout"&&(h=a.toElement)),this.relatedTarget=h,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Ke.Z.h.call(this)},Ke.prototype.h=function(){Ke.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Un="closure_listenable_"+(Math.random()*1e6|0),z_=0;function G_(a,h,d,m,P){this.listener=a,this.proxy=null,this.src=h,this.type=d,this.capture=!!m,this.ha=P,this.key=++z_,this.da=this.fa=!1}function to(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function no(a,h,d){for(const m in a)h.call(d,a[m],m,a)}function H_(a,h){for(const d in a)h.call(void 0,a[d],d,a)}function eh(a){const h={};for(const d in a)h[d]=a[d];return h}const th="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function nh(a,h){let d,m;for(let P=1;P<arguments.length;P++){m=arguments[P];for(d in m)a[d]=m[d];for(let V=0;V<th.length;V++)d=th[V],Object.prototype.hasOwnProperty.call(m,d)&&(a[d]=m[d])}}function ro(a){this.src=a,this.g={},this.h=0}ro.prototype.add=function(a,h,d,m,P){const V=a.toString();a=this.g[V],a||(a=this.g[V]=[],this.h++);const U=ru(a,h,m,P);return U>-1?(h=a[U],d||(h.fa=!1)):(h=new G_(h,this.src,V,!!m,P),h.fa=d,a.push(h)),h};function nu(a,h){const d=h.type;if(d in a.g){var m=a.g[d],P=Array.prototype.indexOf.call(m,h,void 0),V;(V=P>=0)&&Array.prototype.splice.call(m,P,1),V&&(to(h),a.g[d].length==0&&(delete a.g[d],a.h--))}}function ru(a,h,d,m){for(let P=0;P<a.length;++P){const V=a[P];if(!V.da&&V.listener==h&&V.capture==!!d&&V.ha==m)return P}return-1}var su="closure_lm_"+(Math.random()*1e6|0),iu={};function rh(a,h,d,m,P){if(Array.isArray(h)){for(let V=0;V<h.length;V++)rh(a,h[V],d,m,P);return null}return d=oh(d),a&&a[Un]?a.J(h,d,u(m)?!!m.capture:!1,P):K_(a,h,d,!1,m,P)}function K_(a,h,d,m,P,V){if(!h)throw Error("Invalid event type");const U=u(P)?!!P.capture:!!P;let J=au(a);if(J||(a[su]=J=new ro(a)),d=J.add(h,d,m,U,V),d.proxy)return d;if(m=W_(),d.proxy=m,m.src=a,m.listener=d,a.addEventListener)b||(P=U),P===void 0&&(P=!1),a.addEventListener(h.toString(),m,P);else if(a.attachEvent)a.attachEvent(ih(h.toString()),m);else if(a.addListener&&a.removeListener)a.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return d}function W_(){function a(d){return h.call(a.src,a.listener,d)}const h=Q_;return a}function sh(a,h,d,m,P){if(Array.isArray(h))for(var V=0;V<h.length;V++)sh(a,h[V],d,m,P);else m=u(m)?!!m.capture:!!m,d=oh(d),a&&a[Un]?(a=a.i,V=String(h).toString(),V in a.g&&(h=a.g[V],d=ru(h,d,m,P),d>-1&&(to(h[d]),Array.prototype.splice.call(h,d,1),h.length==0&&(delete a.g[V],a.h--)))):a&&(a=au(a))&&(h=a.g[h.toString()],a=-1,h&&(a=ru(h,d,m,P)),(d=a>-1?h[a]:null)&&ou(d))}function ou(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[Un])nu(h.i,a);else{var d=a.type,m=a.proxy;h.removeEventListener?h.removeEventListener(d,m,a.capture):h.detachEvent?h.detachEvent(ih(d),m):h.addListener&&h.removeListener&&h.removeListener(m),(d=au(h))?(nu(d,a),d.h==0&&(d.src=null,h[su]=null)):to(a)}}}function ih(a){return a in iu?iu[a]:iu[a]="on"+a}function Q_(a,h){if(a.da)a=!0;else{h=new Ke(h,this);const d=a.listener,m=a.ha||a.src;a.fa&&ou(a),a=d.call(m,h)}return a}function au(a){return a=a[su],a instanceof ro?a:null}var uu="__closure_events_fn_"+(Math.random()*1e9>>>0);function oh(a){return typeof a=="function"?a:(a[uu]||(a[uu]=function(h){return a.handleEvent(h)}),a[uu])}function Oe(){v.call(this),this.i=new ro(this),this.M=this,this.G=null}p(Oe,v),Oe.prototype[Un]=!0,Oe.prototype.removeEventListener=function(a,h,d,m){sh(this,a,h,d,m)};function $e(a,h){var d,m=a.G;if(m)for(d=[];m;m=m.G)d.push(m);if(a=a.M,m=h.type||h,typeof h=="string")h=new w(h,a);else if(h instanceof w)h.target=h.target||a;else{var P=h;h=new w(m,a),nh(h,P)}P=!0;let V,U;if(d)for(U=d.length-1;U>=0;U--)V=h.g=d[U],P=so(V,m,!0,h)&&P;if(V=h.g=a,P=so(V,m,!0,h)&&P,P=so(V,m,!1,h)&&P,d)for(U=0;U<d.length;U++)V=h.g=d[U],P=so(V,m,!1,h)&&P}Oe.prototype.N=function(){if(Oe.Z.N.call(this),this.i){var a=this.i;for(const h in a.g){const d=a.g[h];for(let m=0;m<d.length;m++)to(d[m]);delete a.g[h],a.h--}}this.G=null},Oe.prototype.J=function(a,h,d,m){return this.i.add(String(a),h,!1,d,m)},Oe.prototype.K=function(a,h,d,m){return this.i.add(String(a),h,!0,d,m)};function so(a,h,d,m){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();let P=!0;for(let V=0;V<h.length;++V){const U=h[V];if(U&&!U.da&&U.capture==d){const J=U.listener,we=U.ha||U.src;U.fa&&nu(a.i,U),P=J.call(we,m)!==!1&&P}}return P&&!m.defaultPrevented}function Y_(a,h){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=l(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(a,h||0)}function ah(a){a.g=Y_(()=>{a.g=null,a.i&&(a.i=!1,ah(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class X_ extends v{constructor(h,d){super(),this.m=h,this.l=d,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:ah(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Is(a){v.call(this),this.h=a,this.g={}}p(Is,v);var uh=[];function ch(a){no(a.g,function(h,d){this.g.hasOwnProperty(d)&&ou(h)},a),a.g={}}Is.prototype.N=function(){Is.Z.N.call(this),ch(this)},Is.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var cu=o.JSON.stringify,J_=o.JSON.parse,Z_=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function lh(){}function hh(){}var Ts={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function lu(){w.call(this,"d")}p(lu,w);function hu(){w.call(this,"c")}p(hu,w);var Fn={},dh=null;function io(){return dh=dh||new Oe}Fn.Ia="serverreachability";function fh(a){w.call(this,Fn.Ia,a)}p(fh,w);function Es(a){const h=io();$e(h,new fh(h))}Fn.STAT_EVENT="statevent";function ph(a,h){w.call(this,Fn.STAT_EVENT,a),this.stat=h}p(ph,w);function je(a){const h=io();$e(h,new ph(h,a))}Fn.Ja="timingevent";function mh(a,h){w.call(this,Fn.Ja,a),this.size=h}p(mh,w);function ws(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},h)}function vs(){this.g=!0}vs.prototype.ua=function(){this.g=!1};function ey(a,h,d,m,P,V){a.info(function(){if(a.g)if(V){var U="",J=V.split("&");for(let ae=0;ae<J.length;ae++){var we=J[ae].split("=");if(we.length>1){const be=we[0];we=we[1];const It=be.split("_");U=It.length>=2&&It[1]=="type"?U+(be+"="+we+"&"):U+(be+"=redacted&")}}}else U=null;else U=V;return"XMLHTTP REQ ("+m+") [attempt "+P+"]: "+h+`
`+d+`
`+U})}function ty(a,h,d,m,P,V,U){a.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+P+"]: "+h+`
`+d+`
`+V+" "+U})}function xr(a,h,d,m){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+ry(a,d)+(m?" "+m:"")})}function ny(a,h){a.info(function(){return"TIMEOUT: "+h})}vs.prototype.info=function(){};function ry(a,h){if(!a.g)return h;if(!h)return null;try{const V=JSON.parse(h);if(V){for(a=0;a<V.length;a++)if(Array.isArray(V[a])){var d=V[a];if(!(d.length<2)){var m=d[1];if(Array.isArray(m)&&!(m.length<1)){var P=m[0];if(P!="noop"&&P!="stop"&&P!="close")for(let U=1;U<m.length;U++)m[U]=""}}}}return cu(V)}catch{return h}}var oo={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},gh={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},_h;function du(){}p(du,lh),du.prototype.g=function(){return new XMLHttpRequest},_h=new du;function As(a){return encodeURIComponent(String(a))}function sy(a){var h=1;a=a.split(":");const d=[];for(;h>0&&a.length;)d.push(a.shift()),h--;return a.length&&d.push(a.join(":")),d}function Jt(a,h,d,m){this.j=a,this.i=h,this.l=d,this.S=m||1,this.V=new Is(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new yh}function yh(){this.i=null,this.g="",this.h=!1}var Ih={},fu={};function pu(a,h,d){a.M=1,a.A=uo(yt(h)),a.u=d,a.R=!0,Th(a,null)}function Th(a,h){a.F=Date.now(),ao(a),a.B=yt(a.A);var d=a.B,m=a.S;Array.isArray(m)||(m=[String(m)]),kh(d.i,"t",m),a.C=0,d=a.j.L,a.h=new yh,a.g=Xh(a.j,d?h:null,!a.u),a.P>0&&(a.O=new X_(l(a.Y,a,a.g),a.P)),h=a.V,d=a.g,m=a.ba;var P="readystatechange";Array.isArray(P)||(P&&(uh[0]=P.toString()),P=uh);for(let V=0;V<P.length;V++){const U=rh(d,P[V],m||h.handleEvent,!1,h.h||h);if(!U)break;h.g[U.key]=U}h=a.J?eh(a.J):{},a.u?(a.v||(a.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,h)):(a.v="GET",a.g.ea(a.B,a.v,null,h)),Es(),ey(a.i,a.v,a.B,a.l,a.S,a.u)}Jt.prototype.ba=function(a){a=a.target;const h=this.O;h&&tn(a)==3?h.j():this.Y(a)},Jt.prototype.Y=function(a){try{if(a==this.g)e:{const J=tn(this.g),we=this.g.ya(),ae=this.g.ca();if(!(J<3)&&(J!=3||this.g&&(this.h.h||this.g.la()||Bh(this.g)))){this.K||J!=4||we==7||(we==8||ae<=0?Es(3):Es(2)),mu(this);var h=this.g.ca();this.X=h;var d=iy(this);if(this.o=h==200,ty(this.i,this.v,this.B,this.l,this.S,J,h),this.o){if(this.U&&!this.L){t:{if(this.g){var m,P=this.g;if((m=P.g?P.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(m)){var V=m;break t}}V=null}if(a=V)xr(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,gu(this,a);else{this.o=!1,this.m=3,je(12),Bn(this),Rs(this);break e}}if(this.R){a=!0;let be;for(;!this.K&&this.C<d.length;)if(be=oy(this,d),be==fu){J==4&&(this.m=4,je(14),a=!1),xr(this.i,this.l,null,"[Incomplete Response]");break}else if(be==Ih){this.m=4,je(15),xr(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else xr(this.i,this.l,be,null),gu(this,be);if(Eh(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),J!=4||d.length!=0||this.h.h||(this.m=1,je(16),a=!1),this.o=this.o&&a,!a)xr(this.i,this.l,d,"[Invalid Chunked Response]"),Bn(this),Rs(this);else if(d.length>0&&!this.W){this.W=!0;var U=this.j;U.g==this&&U.aa&&!U.P&&(U.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),Au(U),U.P=!0,je(11))}}else xr(this.i,this.l,d,null),gu(this,d);J==4&&Bn(this),this.o&&!this.K&&(J==4?Kh(this.j,this):(this.o=!1,ao(this)))}else Ty(this.g),h==400&&d.indexOf("Unknown SID")>0?(this.m=3,je(12)):(this.m=0,je(13)),Bn(this),Rs(this)}}}catch{}finally{}};function iy(a){if(!Eh(a))return a.g.la();const h=Bh(a.g);if(h==="")return"";let d="";const m=h.length,P=tn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Bn(a),Rs(a),"";a.h.i=new o.TextDecoder}for(let V=0;V<m;V++)a.h.h=!0,d+=a.h.i.decode(h[V],{stream:!(P&&V==m-1)});return h.length=0,a.h.g+=d,a.C=0,a.h.g}function Eh(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function oy(a,h){var d=a.C,m=h.indexOf(`
`,d);return m==-1?fu:(d=Number(h.substring(d,m)),isNaN(d)?Ih:(m+=1,m+d>h.length?fu:(h=h.slice(m,m+d),a.C=m+d,h)))}Jt.prototype.cancel=function(){this.K=!0,Bn(this)};function ao(a){a.T=Date.now()+a.H,wh(a,a.H)}function wh(a,h){if(a.D!=null)throw Error("WatchDog timer not null");a.D=ws(l(a.aa,a),h)}function mu(a){a.D&&(o.clearTimeout(a.D),a.D=null)}Jt.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(ny(this.i,this.B),this.M!=2&&(Es(),je(17)),Bn(this),this.m=2,Rs(this)):wh(this,this.T-a)};function Rs(a){a.j.I==0||a.K||Kh(a.j,a)}function Bn(a){mu(a);var h=a.O;h&&typeof h.dispose=="function"&&h.dispose(),a.O=null,ch(a.V),a.g&&(h=a.g,a.g=null,h.abort(),h.dispose())}function gu(a,h){try{var d=a.j;if(d.I!=0&&(d.g==a||_u(d.h,a))){if(!a.L&&_u(d.h,a)&&d.I==3){try{var m=d.Ba.g.parse(h)}catch{m=null}if(Array.isArray(m)&&m.length==3){var P=m;if(P[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)po(d),ho(d);else break e;vu(d),je(18)}}else d.xa=P[1],0<d.xa-d.K&&P[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=ws(l(d.Va,d),6e3));Rh(d.h)<=1&&d.ta&&(d.ta=void 0)}else $n(d,11)}else if((a.L||d.g==a)&&po(d),!y(h))for(P=d.Ba.g.parse(h),h=0;h<P.length;h++){let ae=P[h];const be=ae[0];if(!(be<=d.K))if(d.K=be,ae=ae[1],d.I==2)if(ae[0]=="c"){d.M=ae[1],d.ba=ae[2];const It=ae[3];It!=null&&(d.ka=It,d.j.info("VER="+d.ka));const jn=ae[4];jn!=null&&(d.za=jn,d.j.info("SVER="+d.za));const nn=ae[5];nn!=null&&typeof nn=="number"&&nn>0&&(m=1.5*nn,d.O=m,d.j.info("backChannelRequestTimeoutMs_="+m)),m=d;const rn=a.g;if(rn){const go=rn.g?rn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(go){var V=m.h;V.g||go.indexOf("spdy")==-1&&go.indexOf("quic")==-1&&go.indexOf("h2")==-1||(V.j=V.l,V.g=new Set,V.h&&(yu(V,V.h),V.h=null))}if(m.G){const Ru=rn.g?rn.g.getResponseHeader("X-HTTP-Session-Id"):null;Ru&&(m.wa=Ru,ce(m.J,m.G,Ru))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),m=d;var U=a;if(m.na=Yh(m,m.L?m.ba:null,m.W),U.L){Ph(m.h,U);var J=U,we=m.O;we&&(J.H=we),J.D&&(mu(J),ao(J)),m.g=U}else Gh(m);d.i.length>0&&fo(d)}else ae[0]!="stop"&&ae[0]!="close"||$n(d,7);else d.I==3&&(ae[0]=="stop"||ae[0]=="close"?ae[0]=="stop"?$n(d,7):wu(d):ae[0]!="noop"&&d.l&&d.l.qa(ae),d.A=0)}}Es(4)}catch{}}var ay=class{constructor(a,h){this.g=a,this.map=h}};function vh(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Ah(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Rh(a){return a.h?1:a.g?a.g.size:0}function _u(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function yu(a,h){a.g?a.g.add(h):a.h=h}function Ph(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}vh.prototype.cancel=function(){if(this.i=bh(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function bh(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const d of a.g.values())h=h.concat(d.G);return h}return A(a.i)}var Sh=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function uy(a,h){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const m=a[d].indexOf("=");let P,V=null;m>=0?(P=a[d].substring(0,m),V=a[d].substring(m+1)):P=a[d],h(P,V?decodeURIComponent(V.replace(/\+/g," ")):"")}}}function Zt(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;a instanceof Zt?(this.l=a.l,Ps(this,a.j),this.o=a.o,this.g=a.g,bs(this,a.u),this.h=a.h,Iu(this,Dh(a.i)),this.m=a.m):a&&(h=String(a).match(Sh))?(this.l=!1,Ps(this,h[1]||"",!0),this.o=Ss(h[2]||""),this.g=Ss(h[3]||"",!0),bs(this,h[4]),this.h=Ss(h[5]||"",!0),Iu(this,h[6]||"",!0),this.m=Ss(h[7]||"")):(this.l=!1,this.i=new Cs(null,this.l))}Zt.prototype.toString=function(){const a=[];var h=this.j;h&&a.push(Vs(h,Vh,!0),":");var d=this.g;return(d||h=="file")&&(a.push("//"),(h=this.o)&&a.push(Vs(h,Vh,!0),"@"),a.push(As(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(Vs(d,d.charAt(0)=="/"?hy:ly,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",Vs(d,fy)),a.join("")},Zt.prototype.resolve=function(a){const h=yt(this);let d=!!a.j;d?Ps(h,a.j):d=!!a.o,d?h.o=a.o:d=!!a.g,d?h.g=a.g:d=a.u!=null;var m=a.h;if(d)bs(h,a.u);else if(d=!!a.h){if(m.charAt(0)!="/")if(this.g&&!this.h)m="/"+m;else{var P=h.h.lastIndexOf("/");P!=-1&&(m=h.h.slice(0,P+1)+m)}if(P=m,P==".."||P==".")m="";else if(P.indexOf("./")!=-1||P.indexOf("/.")!=-1){m=P.lastIndexOf("/",0)==0,P=P.split("/");const V=[];for(let U=0;U<P.length;){const J=P[U++];J=="."?m&&U==P.length&&V.push(""):J==".."?((V.length>1||V.length==1&&V[0]!="")&&V.pop(),m&&U==P.length&&V.push("")):(V.push(J),m=!0)}m=V.join("/")}else m=P}return d?h.h=m:d=a.i.toString()!=="",d?Iu(h,Dh(a.i)):d=!!a.m,d&&(h.m=a.m),h};function yt(a){return new Zt(a)}function Ps(a,h,d){a.j=d?Ss(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function bs(a,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);a.u=h}else a.u=null}function Iu(a,h,d){h instanceof Cs?(a.i=h,py(a.i,a.l)):(d||(h=Vs(h,dy)),a.i=new Cs(h,a.l))}function ce(a,h,d){a.i.set(h,d)}function uo(a){return ce(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Ss(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Vs(a,h,d){return typeof a=="string"?(a=encodeURI(a).replace(h,cy),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function cy(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Vh=/[#\/\?@]/g,ly=/[#\?:]/g,hy=/[#\?]/g,dy=/[#\?@]/g,fy=/#/g;function Cs(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function qn(a){a.g||(a.g=new Map,a.h=0,a.i&&uy(a.i,function(h,d){a.add(decodeURIComponent(h.replace(/\+/g," ")),d)}))}n=Cs.prototype,n.add=function(a,h){qn(this),this.i=null,a=Nr(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(h),this.h+=1,this};function Ch(a,h){qn(a),h=Nr(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function xh(a,h){return qn(a),h=Nr(a,h),a.g.has(h)}n.forEach=function(a,h){qn(this),this.g.forEach(function(d,m){d.forEach(function(P){a.call(h,P,m,this)},this)},this)};function Nh(a,h){qn(a);let d=[];if(typeof h=="string")xh(a,h)&&(d=d.concat(a.g.get(Nr(a,h))));else for(a=Array.from(a.g.values()),h=0;h<a.length;h++)d=d.concat(a[h]);return d}n.set=function(a,h){return qn(this),this.i=null,a=Nr(this,a),xh(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},n.get=function(a,h){return a?(a=Nh(this,a),a.length>0?String(a[0]):h):h};function kh(a,h,d){Ch(a,h),d.length>0&&(a.i=null,a.g.set(Nr(a,h),A(d)),a.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(let m=0;m<h.length;m++){var d=h[m];const P=As(d);d=Nh(this,d);for(let V=0;V<d.length;V++){let U=P;d[V]!==""&&(U+="="+As(d[V])),a.push(U)}}return this.i=a.join("&")};function Dh(a){const h=new Cs;return h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),h}function Nr(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function py(a,h){h&&!a.j&&(qn(a),a.i=null,a.g.forEach(function(d,m){const P=m.toLowerCase();m!=P&&(Ch(this,m),kh(this,P,d))},a)),a.j=h}function my(a,h){const d=new vs;if(o.Image){const m=new Image;m.onload=f(en,d,"TestLoadImage: loaded",!0,h,m),m.onerror=f(en,d,"TestLoadImage: error",!1,h,m),m.onabort=f(en,d,"TestLoadImage: abort",!1,h,m),m.ontimeout=f(en,d,"TestLoadImage: timeout",!1,h,m),o.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=a}else h(!1)}function gy(a,h){const d=new vs,m=new AbortController,P=setTimeout(()=>{m.abort(),en(d,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:m.signal}).then(V=>{clearTimeout(P),V.ok?en(d,"TestPingServer: ok",!0,h):en(d,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(P),en(d,"TestPingServer: error",!1,h)})}function en(a,h,d,m,P){try{P&&(P.onload=null,P.onerror=null,P.onabort=null,P.ontimeout=null),m(d)}catch{}}function _y(){this.g=new Z_}function Tu(a){this.i=a.Sb||null,this.h=a.ab||!1}p(Tu,lh),Tu.prototype.g=function(){return new co(this.i,this.h)};function co(a,h){Oe.call(this),this.H=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(co,Oe),n=co.prototype,n.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=h,this.readyState=1,Ns(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(h.body=a),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,xs(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Ns(this)),this.g&&(this.readyState=3,Ns(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Oh(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Oh(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?xs(this):Ns(this),this.readyState==3&&Oh(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,xs(this))},n.Na=function(a){this.g&&(this.response=a,xs(this))},n.ga=function(){this.g&&xs(this)};function xs(a){a.readyState=4,a.l=null,a.j=null,a.B=null,Ns(a)}n.setRequestHeader=function(a,h){this.A.append(a,h)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var d=h.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=h.next();return a.join(`\r
`)};function Ns(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(co.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Lh(a){let h="";return no(a,function(d,m){h+=m,h+=":",h+=d,h+=`\r
`}),h}function Eu(a,h,d){e:{for(m in d){var m=!1;break e}m=!0}m||(d=Lh(d),typeof a=="string"?d!=null&&As(d):ce(a,h,d))}function me(a){Oe.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(me,Oe);var yy=/^https?$/i,Iy=["POST","PUT"];n=me.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,h,d,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():_h.g(),this.g.onreadystatechange=g(l(this.Ca,this));try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(V){Mh(this,V);return}if(a=d||"",d=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var P in m)d.set(P,m[P]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const V of m.keys())d.set(V,m.get(V));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(d.keys()).find(V=>V.toLowerCase()=="content-type"),P=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(Iy,h,void 0)>=0)||m||P||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[V,U]of d)this.g.setRequestHeader(V,U);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(V){Mh(this,V)}};function Mh(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.o=5,Uh(a),lo(a)}function Uh(a){a.A||(a.A=!0,$e(a,"complete"),$e(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,$e(this,"complete"),$e(this,"abort"),lo(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),lo(this,!0)),me.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Fh(this):this.Xa())},n.Xa=function(){Fh(this)};function Fh(a){if(a.h&&typeof i<"u"){if(a.v&&tn(a)==4)setTimeout(a.Ca.bind(a),0);else if($e(a,"readystatechange"),tn(a)==4){a.h=!1;try{const V=a.ca();e:switch(V){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var d;if(!(d=h)){var m;if(m=V===0){let U=String(a.D).match(Sh)[1]||null;!U&&o.self&&o.self.location&&(U=o.self.location.protocol.slice(0,-1)),m=!yy.test(U?U.toLowerCase():"")}d=m}if(d)$e(a,"complete"),$e(a,"success");else{a.o=6;try{var P=tn(a)>2?a.g.statusText:""}catch{P=""}a.l=P+" ["+a.ca()+"]",Uh(a)}}finally{lo(a)}}}}function lo(a,h){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,h||$e(a,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function tn(a){return a.g?a.g.readyState:0}n.ca=function(){try{return tn(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),J_(h)}};function Bh(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function Ty(a){const h={};a=(a.g&&tn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<a.length;m++){if(y(a[m]))continue;var d=sy(a[m]);const P=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const V=h[P]||[];h[P]=V,V.push(d)}H_(h,function(m){return m.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function ks(a,h,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||h}function qh(a){this.za=0,this.i=[],this.j=new vs,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=ks("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=ks("baseRetryDelayMs",5e3,a),this.Za=ks("retryDelaySeedMs",1e4,a),this.Ta=ks("forwardChannelMaxRetries",2,a),this.va=ks("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new vh(a&&a.concurrentRequestLimit),this.Ba=new _y,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=qh.prototype,n.ka=8,n.I=1,n.connect=function(a,h,d,m){je(0),this.W=a,this.H=h||{},d&&m!==void 0&&(this.H.OSID=d,this.H.OAID=m),this.F=this.X,this.J=Yh(this,null,this.W),fo(this)};function wu(a){if($h(a),a.I==3){var h=a.V++,d=yt(a.J);if(ce(d,"SID",a.M),ce(d,"RID",h),ce(d,"TYPE","terminate"),Ds(a,d),h=new Jt(a,a.j,h),h.M=2,h.A=uo(yt(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=h.A,d=!0),d||(h.g=Xh(h.j,null),h.g.ea(h.A)),h.F=Date.now(),ao(h)}Qh(a)}function ho(a){a.g&&(Au(a),a.g.cancel(),a.g=null)}function $h(a){ho(a),a.v&&(o.clearTimeout(a.v),a.v=null),po(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function fo(a){if(!Ah(a.h)&&!a.m){a.m=!0;var h=a.Ea;X||_(),Z||(X(),Z=!0),T.add(h,a),a.D=0}}function Ey(a,h){return Rh(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=h.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=ws(l(a.Ea,a,h),Wh(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const P=new Jt(this,this.j,a);let V=this.o;if(this.U&&(V?(V=eh(V),nh(V,this.U)):V=this.U),this.u!==null||this.R||(P.J=V,V=null),this.S)e:{for(var h=0,d=0;d<this.i.length;d++){t:{var m=this.i[d];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(h+=m,h>4096){h=d;break e}if(h===4096||d===this.i.length-1){h=d+1;break e}}h=1e3}else h=1e3;h=zh(this,P,h),d=yt(this.J),ce(d,"RID",a),ce(d,"CVER",22),this.G&&ce(d,"X-HTTP-Session-Id",this.G),Ds(this,d),V&&(this.R?h="headers="+As(Lh(V))+"&"+h:this.u&&Eu(d,this.u,V)),yu(this.h,P),this.Ra&&ce(d,"TYPE","init"),this.S?(ce(d,"$req",h),ce(d,"SID","null"),P.U=!0,pu(P,d,null)):pu(P,d,h),this.I=2}}else this.I==3&&(a?jh(this,a):this.i.length==0||Ah(this.h)||jh(this))};function jh(a,h){var d;h?d=h.l:d=a.V++;const m=yt(a.J);ce(m,"SID",a.M),ce(m,"RID",d),ce(m,"AID",a.K),Ds(a,m),a.u&&a.o&&Eu(m,a.u,a.o),d=new Jt(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),h&&(a.i=h.G.concat(a.i)),h=zh(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),yu(a.h,d),pu(d,m,h)}function Ds(a,h){a.H&&no(a.H,function(d,m){ce(h,m,d)}),a.l&&no({},function(d,m){ce(h,m,d)})}function zh(a,h,d){d=Math.min(a.i.length,d);const m=a.l?l(a.l.Ka,a.l,a):null;e:{var P=a.i;let J=-1;for(;;){const we=["count="+d];J==-1?d>0?(J=P[0].g,we.push("ofs="+J)):J=0:we.push("ofs="+J);let ae=!0;for(let be=0;be<d;be++){var V=P[be].g;const It=P[be].map;if(V-=J,V<0)J=Math.max(0,P[be].g-100),ae=!1;else try{V="req"+V+"_"||"";try{var U=It instanceof Map?It:Object.entries(It);for(const[jn,nn]of U){let rn=nn;u(nn)&&(rn=cu(nn)),we.push(V+jn+"="+encodeURIComponent(rn))}}catch(jn){throw we.push(V+"type="+encodeURIComponent("_badmap")),jn}}catch{m&&m(It)}}if(ae){U=we.join("&");break e}}U=void 0}return a=a.i.splice(0,d),h.G=a,U}function Gh(a){if(!a.g&&!a.v){a.Y=1;var h=a.Da;X||_(),Z||(X(),Z=!0),T.add(h,a),a.A=0}}function vu(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=ws(l(a.Da,a),Wh(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,Hh(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=ws(l(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,je(10),ho(this),Hh(this))};function Au(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function Hh(a){a.g=new Jt(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var h=yt(a.na);ce(h,"RID","rpc"),ce(h,"SID",a.M),ce(h,"AID",a.K),ce(h,"CI",a.F?"0":"1"),!a.F&&a.ia&&ce(h,"TO",a.ia),ce(h,"TYPE","xmlhttp"),Ds(a,h),a.u&&a.o&&Eu(h,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=uo(yt(h)),d.u=null,d.R=!0,Th(d,a)}n.Va=function(){this.C!=null&&(this.C=null,ho(this),vu(this),je(19))};function po(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function Kh(a,h){var d=null;if(a.g==h){po(a),Au(a),a.g=null;var m=2}else if(_u(a.h,h))d=h.G,Ph(a.h,h),m=1;else return;if(a.I!=0){if(h.o)if(m==1){d=h.u?h.u.length:0,h=Date.now()-h.F;var P=a.D;m=io(),$e(m,new mh(m,d)),fo(a)}else Gh(a);else if(P=h.m,P==3||P==0&&h.X>0||!(m==1&&Ey(a,h)||m==2&&vu(a)))switch(d&&d.length>0&&(h=a.h,h.i=h.i.concat(d)),P){case 1:$n(a,5);break;case 4:$n(a,10);break;case 3:$n(a,6);break;default:$n(a,2)}}}function Wh(a,h){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*h}function $n(a,h){if(a.j.info("Error code "+h),h==2){var d=l(a.bb,a),m=a.Ua;const P=!m;m=new Zt(m||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||Ps(m,"https"),uo(m),P?my(m.toString(),d):gy(m.toString(),d)}else je(2);a.I=0,a.l&&a.l.pa(h),Qh(a),$h(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),je(2)):(this.j.info("Failed to ping google.com"),je(1))};function Qh(a){if(a.I=0,a.ja=[],a.l){const h=bh(a.h);(h.length!=0||a.i.length!=0)&&(S(a.ja,h),S(a.ja,a.i),a.h.i.length=0,A(a.i),a.i.length=0),a.l.oa()}}function Yh(a,h,d){var m=d instanceof Zt?yt(d):new Zt(d);if(m.g!="")h&&(m.g=h+"."+m.g),bs(m,m.u);else{var P=o.location;m=P.protocol,h=h?h+"."+P.hostname:P.hostname,P=+P.port;const V=new Zt(null);m&&Ps(V,m),h&&(V.g=h),P&&bs(V,P),d&&(V.h=d),m=V}return d=a.G,h=a.wa,d&&h&&ce(m,d,h),ce(m,"VER",a.ka),Ds(a,m),m}function Xh(a,h,d){if(h&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Aa&&!a.ma?new me(new Tu({ab:d})):new me(a.ma),h.Fa(a.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Jh(){}n=Jh.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function mo(){}mo.prototype.g=function(a,h){return new tt(a,h)};function tt(a,h){Oe.call(this),this.g=new qh(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(a?a["X-WebChannel-Client-Profile"]=h.sa:a={"X-WebChannel-Client-Profile":h.sa}),this.g.U=a,(a=h&&h.Qb)&&!y(a)&&(this.g.u=a),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.G=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new kr(this)}p(tt,Oe),tt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},tt.prototype.close=function(){wu(this.g)},tt.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=cu(a),a=d);h.i.push(new ay(h.Ya++,a)),h.I==3&&fo(h)},tt.prototype.N=function(){this.g.l=null,delete this.j,wu(this.g),delete this.g,tt.Z.N.call(this)};function Zh(a){lu.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const d in h){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}p(Zh,lu);function ed(){hu.call(this),this.status=1}p(ed,hu);function kr(a){this.g=a}p(kr,Jh),kr.prototype.ra=function(){$e(this.g,"a")},kr.prototype.qa=function(a){$e(this.g,new Zh(a))},kr.prototype.pa=function(a){$e(this.g,new ed)},kr.prototype.oa=function(){$e(this.g,"b")},mo.prototype.createWebChannel=mo.prototype.g,tt.prototype.send=tt.prototype.o,tt.prototype.open=tt.prototype.m,tt.prototype.close=tt.prototype.close,nm=function(){return new mo},tm=function(){return io()},em=Fn,Wu={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},oo.NO_ERROR=0,oo.TIMEOUT=8,oo.HTTP_ERROR=6,Do=oo,gh.COMPLETE="complete",Zp=gh,hh.EventType=Ts,Ts.OPEN="a",Ts.CLOSE="b",Ts.ERROR="c",Ts.MESSAGE="d",Oe.prototype.listen=Oe.prototype.J,zs=hh,me.prototype.listenOnce=me.prototype.K,me.prototype.getLastError=me.prototype.Ha,me.prototype.getLastErrorCode=me.prototype.ya,me.prototype.getStatus=me.prototype.ca,me.prototype.getResponseJson=me.prototype.La,me.prototype.getResponseText=me.prototype.la,me.prototype.send=me.prototype.ea,me.prototype.setWithCredentials=me.prototype.Fa,Jp=me}).apply(typeof yo<"u"?yo:typeof self<"u"?self:typeof window<"u"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ds="12.19.0";function YE(n){ds=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mr=new Rc("@firebase/firestore");function $r(){return mr.logLevel}function k(n,...e){if(mr.logLevel<=te.DEBUG){const t=e.map(Lc);mr.debug(`Firestore (${ds}): ${n}`,...t)}}function Ge(n,...e){if(mr.logLevel<=te.ERROR){const t=e.map(Lc);mr.error(`Firestore (${ds}): ${n}`,...t)}}function ft(n,...e){if(mr.logLevel<=te.WARN){const t=e.map(Lc);mr.warn(`Firestore (${ds}): ${n}`,...t)}}function Lc(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function B(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,rm(n,r,t)}function rm(n,e,t){let r=`FIRESTORE (${ds}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Ge(r),new Error(r)}function L(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||rm(e,s,r)}function W(n,e){return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function XE(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=XE(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function K(n,e){return n<e?-1:n>e?1:0}function Qu(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return Cu(s)===Cu(i)?K(s,i):Cu(s)?1:-1}return K(n.length,e.length)}const JE=55296,ZE=57343;function Cu(n){const e=n.charCodeAt(0);return e>=JE&&e<=ZE}function Xr(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}function sm(n){return n+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class le{constructor(e,t){this.comparator=e,this.root=t||xe.EMPTY}insert(e,t){return new le(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,xe.BLACK,null,null))}remove(e){return new le(this.comparator,this.root.remove(e,this.comparator).copy(null,null,xe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Io(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Io(this.root,e,this.comparator,!1)}getReverseIterator(){return new Io(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Io(this.root,e,this.comparator,!0)}}class Io{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class xe{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??xe.RED,this.left=s??xe.EMPTY,this.right=i??xe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new xe(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return xe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return xe.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,xe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,xe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw B(43730,{key:this.key,value:this.value});if(this.right.isRed())throw B(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw B(27949);return e+(this.isRed()?0:1)}}xe.EMPTY=null,xe.RED=!0,xe.BLACK=!1;xe.EMPTY=new class{constructor(){this.size=0}get key(){throw B(57766)}get value(){throw B(16141)}get color(){throw B(16727)}get left(){throw B(29726)}get right(){throw B(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new xe(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(e){this.comparator=e,this.data=new le(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Vd(this.data.getIterator())}getIteratorFrom(e){return new Vd(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof ie)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new ie(this.comparator);return t.data=e,t}}class Vd{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Dr(n){return n.hasNext()?n.getNext():void 0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends Ot{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et="__name__";class Tt{constructor(e,t,r){t===void 0?t=0:t>e.length&&B(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&B(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Tt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Tt?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=Tt.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return K(e.length,t.length)}static compareSegments(e,t){const r=Tt.isNumericId(e),s=Tt.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?Tt.extractNumericId(e).compare(Tt.extractNumericId(t)):Qu(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return In.fromString(e.substring(4,e.length-2))}}class ee extends Tt{construct(e,t,r){return new ee(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new O(C.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new ee(t)}static emptyPath(){return new ee([])}}const ew=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Ae=class jr extends Tt{construct(e,t,r){return new jr(e,t,r)}static isValidIdentifier(e){return ew.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),jr.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Et}static keyField(){return new jr([Et])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new O(C.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const u=e[s];if(u==="\\"){if(s+1===e.length)throw new O(C.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new O(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else u==="`"?(o=!o,s++):u!=="."||o?(r+=u,s++):(i(),s++)}if(i(),o)throw new O(C.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new jr(t)}static emptyPath(){return new jr([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(e){this.fields=e,e.sort(Ae.comparator)}static empty(){return new Ye([])}unionWith(e){let t=new ie(Ae.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ye(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Xr(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zo(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Ln(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function tw(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function im(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(e){this.path=e}static fromPath(e){return new F(ee.fromString(e))}static fromName(e){return new F(ee.fromString(e).popFirst(5))}static empty(){return new F(ee.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ee.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ee.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new F(new ee(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function om(n,e,t){if(!t)throw new O(C.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function nw(n,e,t,r){if(e===!0&&r===!0)throw new O(C.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Cd(n){if(!F.isDocumentKey(n))throw new O(C.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function xd(n){if(F.isDocumentKey(n))throw new O(C.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Li(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Pa(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":B(12329,{type:typeof n})}function Xe(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new O(C.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Pa(n);throw new O(C.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Te(n,e){const t={typeString:n};return e&&(t.value=e),t}function Mi(n,e){if(!Li(n))throw new O(C.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new O(C.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nd=-62135596800,kd=1e6;class se{static now(){return se.fromMillis(Date.now())}static fromDate(e){return se.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*kd);return new se(t,r)}static fromInstant(e){if(!e||typeof e.t!="bigint")throw new O(C.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return se._fromEpochNanoseconds(e.t)}static _fromEpochNanoseconds(e){let t,r;if(e>=0n)t=Number(e/1000000000n),r=Number(e%1000000000n);else{const s=e%1000000000n;s===0n?(t=Number(e/1000000000n),r=0):(t=Number(e/1000000000n-1n),r=Number(s+1000000000n))}return new se(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new O(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new O(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Nd)throw new O(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new O(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/kd}toInstant(){if(typeof Temporal>"u"||!Temporal.Instant)throw new O(C.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?K(this.nanoseconds,e.nanoseconds):K(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:se._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Mi(e,se._jsonSchema))return new se(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Nd;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}se._jsonSchemaVersion="firestore/timestamp/1.0",se._jsonSchema={type:Te("string",se._jsonSchemaVersion),seconds:Te("number"),nanoseconds:Te("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class am extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new am("Invalid base64 string: "+i):i}})(e);return new fe(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new fe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return K(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}fe.EMPTY_BYTE_STRING=new fe("");const rw=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function zt(n){if(L(!!n,39018),typeof n=="string"){let e=0;const t=rw.exec(n);if(L(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ue(n.seconds),nanos:ue(n.nanos)}}function ue(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Gt(n){return typeof n=="string"?fe.fromBase64String(n):fe.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const um="server_timestamp",cm="__type__",lm="__previous_value__",hm="__local_write_time__";function ba(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[cm])==null?void 0:r.stringValue)===um}function Ui(n){const e=n.mapValue.fields[lm];return ba(e)?Ui(e):e}function Jr(n){const e=zt(n.mapValue.fields[hm].timestampValue);return new se(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sw{constructor(e,t,r,s,i,o,u,c,l,f,p,g,A){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=u,this.longPollingOptions=c,this.useFetchStreams=l,this.isUsingEmulator=f,this.apiKey=p,this._customHeaders=g,this.grpcFlowControlWindow=A}}const ea="(default)";class gr{constructor(e,t){this.projectId=e,this.database=t||ea}static empty(){return new gr("","")}get isDefaultDatabase(){return this.database===ea}isEqual(e){return e instanceof gr&&e.projectId===this.projectId&&e.database===this.database}}function iw(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new O(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new gr(n.options.projectId,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nr=-1;function Sa(n){return n==null}function Zr(n){return n===0&&1/n==-1/0}function ow(n){return typeof n=="number"&&Number.isInteger(n)&&!Zr(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function aw(n){return typeof n=="string"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uc="__type__",dm="__max__",yn={mapValue:{fields:{__type__:{stringValue:dm}}}},Fc="__vector__",_r="value",Vt={nullValue:"NULL_VALUE"},Ze={booleanValue:!0},Ve={booleanValue:!1};function Ee(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?ba(n)?4:fm(n)?9007199254740991:yr(n)?10:11:B(28295,{value:n})}function pt(n,e,t){if(n===e)return!0;const r=Ee(n);if(r!==Ee(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Jr(n).isEqual(Jr(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const u=zt(i.timestampValue),c=zt(o.timestampValue);return u.seconds===c.seconds&&u.nanos===c.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,o){return Gt(i.bytesValue).isEqual(Gt(o.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,o){return ue(i.geoPointValue.latitude)===ue(o.geoPointValue.latitude)&&ue(i.geoPointValue.longitude)===ue(o.geoPointValue.longitude)})(n,e);case 2:return(function(i,o,u){if("integerValue"in i&&"integerValue"in o)return ue(i.integerValue)===ue(o.integerValue);let c,l;if("doubleValue"in i&&"doubleValue"in o)c=ue(i.doubleValue),l=ue(o.doubleValue);else{if(!(u!=null&&u.i))return!1;c=ue(i.integerValue??i.doubleValue),l=ue(o.integerValue??o.doubleValue)}return c===l?!!(u!=null&&u.o)||Zr(c)===Zr(l):!!(u===void 0||u.u)&&isNaN(c)&&isNaN(l)})(n,e,t);case 9:return Xr(n.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>pt(s,i,t)));case 10:case 11:return(function(i,o,u){const c=i.mapValue.fields||{},l=o.mapValue.fields||{};if(Zo(c)!==Zo(l))return!1;for(const f in c)if(c.hasOwnProperty(f)&&(l[f]===void 0||!pt(c[f],l[f],u)))return!1;return!0})(n,e,t);default:return B(52216,{left:n})}}function di(n,e){return(n.values||[]).find((t=>pt(t,e)))!==void 0}function Be(n,e){if(n===e)return 0;const t=Ee(n),r=Ee(e);if(t!==r)return K(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return K(n.booleanValue,e.booleanValue);case 2:return(function(i,o){const u=ue(i.integerValue||i.doubleValue),c=ue(o.integerValue||o.doubleValue);return u<c?-1:u>c?1:u===c?0:isNaN(u)?isNaN(c)?0:-1:1})(n,e);case 3:return Dd(n.timestampValue,e.timestampValue);case 4:return Dd(Jr(n),Jr(e));case 5:return Qu(n.stringValue,e.stringValue);case 6:return(function(i,o){const u=Gt(i),c=Gt(o);return u.compareTo(c)})(n.bytesValue,e.bytesValue);case 7:return(function(i,o){const u=i.split("/"),c=o.split("/");for(let l=0;l<u.length&&l<c.length;l++){const f=K(u[l],c[l]);if(f!==0)return f}return K(u.length,c.length)})(n.referenceValue,e.referenceValue);case 8:return(function(i,o){const u=K(ue(i.latitude),ue(o.latitude));return u!==0?u:K(ue(i.longitude),ue(o.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return Od(n.arrayValue,e.arrayValue);case 10:return(function(i,o){var g,A,S,D;const u=i.fields||{},c=o.fields||{},l=(g=u[_r])==null?void 0:g.arrayValue,f=(A=c[_r])==null?void 0:A.arrayValue,p=K(((S=l==null?void 0:l.values)==null?void 0:S.length)||0,((D=f==null?void 0:f.values)==null?void 0:D.length)||0);return p!==0?p:Od(l,f)})(n.mapValue,e.mapValue);case 11:return(function(i,o){if(i===yn.mapValue&&o===yn.mapValue)return 0;if(i===yn.mapValue)return 1;if(o===yn.mapValue)return-1;const u=i.fields||{},c=Object.keys(u),l=o.fields||{},f=Object.keys(l);c.sort(),f.sort();for(let p=0;p<c.length&&p<f.length;++p){const g=Qu(c[p],f[p]);if(g!==0)return g;const A=Be(u[c[p]],l[f[p]]);if(A!==0)return A}return K(c.length,f.length)})(n.mapValue,e.mapValue);default:throw B(23264,{l:t})}}function Dd(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return K(n,e);const t=zt(n),r=zt(e),s=K(t.seconds,r.seconds);return s!==0?s:K(t.nanos,r.nanos)}function Od(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Be(t[s],r[s]);if(i!==void 0&&i!==0)return i}return K(t.length,r.length)}function es(n){return Yu(n)}function Yu(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=zt(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return Gt(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return F.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=Yu(i);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${Yu(t.fields[o])}`;return s+"}"})(n.mapValue):B(61005,{value:n})}function Oo(n){switch(Ee(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Ui(n);return e?16+Oo(e):16;case 5:return 2*n.stringValue.length;case 6:return Gt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,i)=>s+Oo(i)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return Ln(r.fields,((i,o)=>{s+=i.length+Oo(o)})),s})(n.mapValue);default:throw B(13486,{value:n})}}function fi(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function wt(n){return!!n&&"integerValue"in n}function Zn(n){return!!n&&"doubleValue"in n}function Rn(n){return wt(n)||Zn(n)}function Pn(n){return!!n&&"arrayValue"in n}function st(n){return!!n&&"nullValue"in n}function et(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function rr(n){return!!n&&"mapValue"in n}function yr(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Uc])==null?void 0:r.stringValue)===Fc}function Xu(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[_r])==null?void 0:t.arrayValue}function Ys(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return Ln(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=Ys(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ys(n.arrayValue.values[t]);return e}return{...n}}function fm(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===dm}const pm={mapValue:{fields:{[Uc]:{stringValue:Fc},[_r]:{arrayValue:{}}}}};function uw(n){return"nullValue"in n?Vt:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?fi(gr.empty(),F.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?yr(n)?pm:{mapValue:{}}:B(35942,{value:n})}function cw(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?fi(gr.empty(),F.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?pm:"mapValue"in n?yr(n)?{mapValue:{}}:yn:B(61959,{value:n})}function Ld(n,e){const t=Be(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function Md(n,e){const t=Be(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke{constructor(e){this.value=e}static empty(){return new ke({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!rr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ys(t)}setAll(e){let t=Ae.emptyPath(),r={},s=[];e.forEach(((o,u)=>{if(!t.isImmediateParentOf(u)){const c=this.getFieldsMap(t);this.applyChanges(c,r,s),r={},s=[],t=u.popLast()}o?r[u.lastSegment()]=Ys(o):s.push(u.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());rr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return pt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];rr(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){Ln(t,((s,i)=>e[s]=i));for(const s of r)delete e[s]}clone(){return new ke(Ys(this.value))}}function mm(n){const e=[];return Ln(n.fields,((t,r)=>{const s=new Ae([t]);if(rr(r)){const i=mm(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new Ye(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Va(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Zr(e)?"-0":e}}function Bc(n){return{integerValue:""+n}}function Ca(n,e,t){return ow(e)?Bc(e):Va(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xa{constructor(){this._=void 0}}function lw(n,e,t){return n instanceof ts?(function(s,i){const o={fields:{[cm]:{stringValue:um},[hm]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&ba(i)&&(i=Ui(i)),i&&(o.fields[lm]=i),{mapValue:o}})(t,e):n instanceof ns?_m(n,e):n instanceof rs?ym(n,e):n instanceof Ir?(function(s,i){const o=gm(s,i),u=ta(o)+ta(s.h);return wt(o)&&wt(s.h)?Bc(u):Va(s.serializer,u)})(n,e):n instanceof pi?(function(s,i){return Ud(s,i,Math.min)})(n,e):n instanceof mi?(function(s,i){return Ud(s,i,Math.max)})(n,e):void 0}function hw(n,e,t){return n instanceof ns?_m(n,e):n instanceof rs?ym(n,e):t}function gm(n,e){return n instanceof Ir?Rn(e)?e:{integerValue:0}:null}class ts extends xa{}class ns extends xa{constructor(e){super(),this.elements=e}}function _m(n,e){const t=Im(e);for(const r of n.elements)t.some((s=>pt(s,r)))||t.push(r);return{arrayValue:{values:t}}}class rs extends xa{constructor(e){super(),this.elements=e}}function ym(n,e){let t=Im(e);for(const r of n.elements)t=t.filter((s=>!pt(s,r)));return{arrayValue:{values:t}}}class qc extends xa{constructor(e,t){super(),this.serializer=e,this.h=t}}class Ir extends qc{}class pi extends qc{}class mi extends qc{}function Ud(n,e,t){if(!Rn(e))return n.h;const r=t(ta(e),ta(n.h));return wt(e)&&wt(n.h)?Bc(r):Va(n.serializer,r)}function ta(n){return ue(n.integerValue||n.doubleValue)}function Im(n){return Pn(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $c{constructor(e,t){this.field=e,this.transform=t}}function dw(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof ns&&s instanceof ns||r instanceof rs&&s instanceof rs?Xr(r.elements,s.elements,pt):r instanceof Ir&&s instanceof Ir||r instanceof pi&&s instanceof pi||r instanceof mi&&s instanceof mi?pt(r.h,s.h):r instanceof ts&&s instanceof ts})(n.transform,e.transform)}class fw{constructor(e,t){this.version=e,this.transformResults=t}}class Ce{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ce}static exists(e){return new Ce(void 0,e)}static updateTime(e){return new Ce(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Lo(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Na{}function Tm(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Fi(n.key,Ce.none()):new fs(n.key,n.data,Ce.none());{const t=n.data,r=ke.empty();let s=new ie(Ae.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new Qt(n.key,r,new Ye(s.toArray()),Ce.none())}}function pw(n,e,t){n instanceof fs?(function(s,i,o){const u=s.value.clone(),c=Bd(s.fieldTransforms,i,o.transformResults);u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()})(n,e,t):n instanceof Qt?(function(s,i,o){if(!Lo(s.precondition,i))return void i.convertToUnknownDocument(o.version);const u=Bd(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(Em(s)),c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(n,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Xs(n,e,t,r){return n instanceof fs?(function(i,o,u,c){if(!Lo(i.precondition,o))return u;const l=i.value.clone(),f=qd(i.fieldTransforms,c,o);return l.setAll(f),o.convertToFoundDocument(o.version,l).setHasLocalMutations(),null})(n,e,t,r):n instanceof Qt?(function(i,o,u,c){if(!Lo(i.precondition,o))return u;const l=qd(i.fieldTransforms,c,o),f=o.data;return f.setAll(Em(i)),f.setAll(l),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((p=>p.field)))})(n,e,t,r):(function(i,o,u){return Lo(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):u})(n,e,t)}function mw(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=gm(r.transform,s||null);i!=null&&(t===null&&(t=ke.empty()),t.set(r.field,i))}return t||null}function Fd(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Xr(r,s,((i,o)=>dw(i,o)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class fs extends Na{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Qt extends Na{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Em(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function Bd(n,e,t){const r=new Map;L(n.length===t.length,32656,{T:t.length,P:n.length});for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,u=e.data.field(i.field);r.set(i.field,hw(o,u,t[s]))}return r}function qd(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,lw(i,o,e))}return r}class Fi extends Na{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class wm extends Na{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss{constructor(e,t){this.position=e,this.inclusive=t}}function $d(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=F.comparator(F.fromName(o.referenceValue),t.key):r=Be(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function jd(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!pt(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vm{}class ne extends vm{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new gw(e,t,r):t==="array-contains"?new Iw(e,r):t==="in"?new Vm(e,r):t==="not-in"?new Tw(e,r):t==="array-contains-any"?new Ew(e,r):new ne(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new _w(e,r):new yw(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Be(t,this.value)):t!==null&&Ee(this.value)===Ee(t)&&this.matchesComparison(Be(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return B(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class oe extends vm{constructor(e,t){super(),this.filters=e,this.op=t,this.I=null}static create(e,t){return new oe(e,t)}matches(e){return is(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.I!==null||(this.I=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.I}getFilters(){return Object.assign([],this.filters)}}function is(n){return n.op==="and"}function Ju(n){return n.op==="or"}function jc(n){return Am(n)&&is(n)}function Am(n){for(const e of n.filters)if(e instanceof oe)return!1;return!0}function Zu(n){if(n instanceof ne)return n.field.canonicalString()+n.op.toString()+es(n.value);if(jc(n))return n.filters.map((e=>Zu(e))).join(",");{const e=n.filters.map((t=>Zu(t))).join(",");return`${n.op}(${e})`}}function Rm(n,e){return n instanceof ne?(function(r,s){return s instanceof ne&&r.op===s.op&&r.field.isEqual(s.field)&&pt(r.value,s.value)})(n,e):n instanceof oe?(function(r,s){return s instanceof oe&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((i,o,u)=>i&&Rm(o,s.filters[u])),!0):!1})(n,e):void B(19439)}function Pm(n,e){const t=n.filters.concat(e);return oe.create(t,n.op)}function bm(n){return n instanceof ne?(function(t){return`${t.field.canonicalString()} ${t.op} ${es(t.value)}`})(n):n instanceof oe?(function(t){return t.op.toString()+" {"+t.getFilters().map(bm).join(" ,")+"}"})(n):"Filter"}class gw extends ne{constructor(e,t,r){super(e,t,r),this.key=F.fromName(r.referenceValue)}matches(e){const t=F.comparator(e.key,this.key);return this.matchesComparison(t)}}class _w extends ne{constructor(e,t){super(e,"in",t),this.keys=Sm("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class yw extends ne{constructor(e,t){super(e,"not-in",t),this.keys=Sm("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Sm(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((r=>F.fromName(r.referenceValue)))}class Iw extends ne{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Pn(t)&&di(t.arrayValue,this.value)}}class Vm extends ne{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&di(this.value.arrayValue,t)}}class Tw extends ne{constructor(e,t){super(e,"not-in",t)}matches(e){if(di(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!di(this.value.arrayValue,t)}}class Ew extends ne{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Pn(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>di(this.value.arrayValue,r)))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi{constructor(e,t="asc"){this.field=e,this.dir=t}}function ww(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z{static fromTimestamp(e){return new z(e)}static min(){return new z(new se(0,0))}static max(){return new z(new se(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ge{constructor(e,t,r,s,i,o,u){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=u}static newInvalidDocument(e){return new ge(e,0,z.min(),z.min(),z.min(),ke.empty(),0)}static newFoundDocument(e,t,r,s){return new ge(e,1,t,z.min(),r,s,0)}static newNoDocument(e,t){return new ge(e,2,t,z.min(),z.min(),ke.empty(),0)}static newUnknownDocument(e,t){return new ge(e,3,t,z.min(),z.min(),ke.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(z.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ke.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ke.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=z.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ge&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ge(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _i=-1;class na{constructor(e,t,r,s){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=s}}function ec(n){return n.fields.find((e=>e.kind===2))}function Gn(n){return n.fields.filter((e=>e.kind!==2))}na.UNKNOWN_ID=-1;class Mo{constructor(e,t){this.fieldPath=e,this.kind=t}}class yi{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new yi(0,ot.min())}}function vw(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=z.fromTimestamp(r===1e9?new se(t+1,0):new se(t,r));return new ot(s,F.empty(),e)}function Cm(n){return new ot(n.readTime,n.key,_i)}class ot{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new ot(z.min(),F.empty(),_i)}static max(){return new ot(z.max(),F.empty(),_i)}}function zc(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=F.comparator(n.documentKey,e.documentKey),t!==0?t:K(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Aw{constructor(e,t=null,r=[],s=[],i=null,o=null,u=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=u,this.R=null}}function tc(n,e=null,t=[],r=[],s=null,i=null,o=null){return new Aw(n,e,t,r,s,i,o)}function ra(n){const e=W(n);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>Zu(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(i){return i.field.canonicalString()+i.dir})(r))).join(","),Sa(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>es(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>es(r))).join(",")),e.R=t}return e.R}function Gc(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!ww(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Rm(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!jd(n.startAt,e.startAt)&&jd(n.endAt,e.endAt)}function mn(n){return!!n.isCorePipeline}function Hc(n){return!!n.path&&F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function sa(n,e){return n.filters.filter((t=>t instanceof ne&&t.field.isEqual(e)))}function zd(n,e,t){let r=Vt,s=!0;for(const i of sa(n,e)){let o=Vt,u=!0;switch(i.op){case"<":case"<=":o=uw(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,u=!1;break;case"!=":case"not-in":o=Vt}Ld({value:r,inclusive:s},{value:o,inclusive:u})<0&&(r=o,s=u)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];Ld({value:r,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}function Gd(n,e,t){let r=yn,s=!0;for(const i of sa(n,e)){let o=yn,u=!0;switch(i.op){case">=":case">":o=cw(i.value),u=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,u=!1;break;case"!=":case"not-in":o=yn}Md({value:r,inclusive:s},{value:o,inclusive:u})>0&&(r=o,s=u)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];Md({value:r,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(e,t=null,r=[],s=[],i=null,o="F",u=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=u,this.endAt=c,this.A=null,this.V=null,this.m=null,this.startAt,this.endAt}}function Rw(n,e,t,r,s,i,o,u){return new ps(n,e,t,r,s,i,o,u)}function Bi(n){return new ps(n)}function Hd(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Pw(n){return F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function xm(n){return n.collectionGroup!==null}function Js(n){const e=W(n);if(e.A===null){e.A=[];const t=new Set;for(const i of e.explicitOrderBy)e.A.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let u=new ie(Ae.comparator);return o.filters.forEach((c=>{c.getFlattenedFilters().forEach((l=>{l.isInequality()&&(u=u.add(l.field))}))})),u})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.A.push(new gi(i,r))})),t.has(Ae.keyField().canonicalString())||e.A.push(new gi(Ae.keyField(),r))}return e.A}function ht(n){const e=W(n);return e.V||(e.V=bw(e,Js(n))),e.V}function bw(n,e){if(n.limitType==="F")return tc(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new gi(s.field,i)}));const t=n.endAt?new ss(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new ss(n.startAt.position,n.startAt.inclusive):null;return tc(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function nc(n,e){const t=n.filters.concat([e]);return new ps(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Sw(n,e){const t=n.explicitOrderBy.concat([e]);return new ps(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function ia(n,e,t){return new ps(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Vw(n,e){return Gc(ht(n),ht(e))&&n.limitType===e.limitType}function Zs(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>bm(s))).join(", ")}]`),Sa(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>es(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>es(s))).join(",")),`Target(${r})`})(ht(n))}; limitType=${n.limitType})`}function ka(n,e){return e.isFoundDocument()&&(function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):F.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)})(n,e)&&(function(r,s){for(const i of Js(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(o,u,c){const l=$d(o,u,c);return o.inclusive?l<=0:l<0})(r.startAt,Js(r),s)||r.endAt&&!(function(o,u,c){const l=$d(o,u,c);return o.inclusive?l>=0:l>0})(r.endAt,Js(r),s))})(n,e)}function Kc(n){return(e,t)=>{let r=!1;for(const s of Js(n)){const i=Cw(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function Cw(n,e,t){const r=n.field.isKeyField()?F.comparator(e.key,t.key):(function(i,o,u){const c=o.data.field(i),l=u.data.field(i);return c!==null&&l!==null?Be(c,l):B(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return B(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xw{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ye,re;function Nw(n){switch(n){case C.OK:return B(64938);case C.CANCELLED:case C.UNKNOWN:case C.DEADLINE_EXCEEDED:case C.RESOURCE_EXHAUSTED:case C.INTERNAL:case C.UNAVAILABLE:case C.UNAUTHENTICATED:return!1;case C.INVALID_ARGUMENT:case C.NOT_FOUND:case C.ALREADY_EXISTS:case C.PERMISSION_DENIED:case C.FAILED_PRECONDITION:case C.ABORTED:case C.OUT_OF_RANGE:case C.UNIMPLEMENTED:case C.DATA_LOSS:return!0;default:return B(15467,{code:n})}}function Nm(n){if(n===void 0)return Ge("GRPC error has no .code"),C.UNKNOWN;switch(n){case ye.OK:return C.OK;case ye.CANCELLED:return C.CANCELLED;case ye.UNKNOWN:return C.UNKNOWN;case ye.DEADLINE_EXCEEDED:return C.DEADLINE_EXCEEDED;case ye.RESOURCE_EXHAUSTED:return C.RESOURCE_EXHAUSTED;case ye.INTERNAL:return C.INTERNAL;case ye.UNAVAILABLE:return C.UNAVAILABLE;case ye.UNAUTHENTICATED:return C.UNAUTHENTICATED;case ye.INVALID_ARGUMENT:return C.INVALID_ARGUMENT;case ye.NOT_FOUND:return C.NOT_FOUND;case ye.ALREADY_EXISTS:return C.ALREADY_EXISTS;case ye.PERMISSION_DENIED:return C.PERMISSION_DENIED;case ye.FAILED_PRECONDITION:return C.FAILED_PRECONDITION;case ye.ABORTED:return C.ABORTED;case ye.OUT_OF_RANGE:return C.OUT_OF_RANGE;case ye.UNIMPLEMENTED:return C.UNIMPLEMENTED;case ye.DATA_LOSS:return C.DATA_LOSS;default:return B(39323,{code:n})}}(re=ye||(ye={}))[re.OK=0]="OK",re[re.CANCELLED=1]="CANCELLED",re[re.UNKNOWN=2]="UNKNOWN",re[re.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",re[re.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",re[re.NOT_FOUND=5]="NOT_FOUND",re[re.ALREADY_EXISTS=6]="ALREADY_EXISTS",re[re.PERMISSION_DENIED=7]="PERMISSION_DENIED",re[re.UNAUTHENTICATED=16]="UNAUTHENTICATED",re[re.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",re[re.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",re[re.ABORTED=10]="ABORTED",re[re.OUT_OF_RANGE=11]="OUT_OF_RANGE",re[re.UNIMPLEMENTED=12]="UNIMPLEMENTED",re[re.INTERNAL=13]="INTERNAL",re[re.UNAVAILABLE=14]="UNAVAILABLE",re[re.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Ln(this.inner,((t,r)=>{for(const[s,i]of r)e(s,i)}))}isEmpty(){return im(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kw=new le(F.comparator);function ve(){return kw}const km=new le(F.comparator);function zr(...n){let e=km;for(const t of n)e=e.insert(t.key,t);return e}function Dm(n){let e=km;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function ut(){return ei()}function Om(){return ei()}function ei(){return new Yt((n=>n.toString()),((n,e)=>n.isEqual(e)))}const Dw=new le(F.comparator),Ow=new ie(F.comparator);function Y(...n){let e=Ow;for(const t of n)e=e.add(t);return e}const Lw=new ie(K);function Mw(){return Lw}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uw(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fw=new In([4294967295,4294967295],0);function Kd(n){const e=Uw().encode(n),t=new Xp;return t.update(e),new Uint8Array(t.digest())}function Wd(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new In([t,r],0),new In([s,i],0)]}class Wc{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Gs(`Invalid padding: ${t}`);if(r<0)throw new Gs(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Gs(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Gs(`Invalid padding when bitmap length is 0: ${t}`);this.p=8*e.length-t,this.S=In.fromNumber(this.p)}v(e,t,r){let s=e.add(t.multiply(In.fromNumber(r)));return s.compare(Fw)===1&&(s=new In([s.getBits(0),s.getBits(1)],0)),s.modulo(this.S).toNumber()}D(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.p===0)return!1;const t=Kd(e),[r,s]=Wd(t);for(let i=0;i<this.hashCount;i++){const o=this.v(r,s,i);if(!this.D(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Wc(i,s,t);return r.forEach((u=>o.insert(u))),o}insert(e){if(this.p===0)return;const t=Kd(e),[r,s]=Wd(t);for(let i=0;i<this.hashCount;i++){const o=this.v(r,s,i);this.C(o)}}C(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Gs extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qi{constructor(e,t,r,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,$i.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new qi(z.min(),s,new le(K),ve(),ve(),Y())}}class $i{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new $i(r,t,Y(),Y(),Y())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uo{constructor(e,t,r,s){this.F=e,this.removedTargetIds=t,this.key=r,this.O=s}}class Lm{constructor(e,t){this.targetId=e,this.M=t}}class Mm{constructor(e,t,r=fe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Qd{constructor(e){this.targetId=e,this.N=0,this.L=Yd(),this.B=fe.EMPTY_BYTE_STRING,this.U=!1,this.k=!0}get current(){return this.U}get resumeToken(){return this.B}get q(){return this.N!==0}get $(){return this.k}K(e){e.approximateByteSize()>0&&(this.k=!0,this.B=e)}W(){let e=Y(),t=Y(),r=Y();return this.L.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:B(38017,{changeType:i})}})),new $i(this.B,this.U,e,t,r)}G(){this.k=!1,this.L=Yd()}j(e,t){this.k=!0,this.L=this.L.insert(e,t)}H(e){this.k=!0,this.L=this.L.remove(e)}J(){this.N+=1}Y(){this.N-=1,L(this.N>=0,3241,{N:this.N,targetId:this.targetId})}Z(){this.k=!0,this.U=!0}}const Os="WatchChangeAggregator";class Bw{constructor(e){this.X=e,this.ee=new Map,this.te=ve(),this.ne=To(),this.re=ve(),this.ie=To(),this.se=new le(K)}_e(e){for(const t of e.F)e.O&&e.O.isFoundDocument()?this.oe(t,e.O):this.ae(t,e.key,e.O);for(const t of e.removedTargetIds)this.ae(t,e.key,e.O)}ue(e){this.forEachTarget(e,(t=>{const r=this.ee.get(t);if(r)switch(e.state){case 0:this.ce(t)&&r.K(e.resumeToken);break;case 1:r.Y(),r.q||r.G(),r.K(e.resumeToken);break;case 2:r.Y(),r.q||this.removeTarget(t);break;case 3:this.ce(t)&&(r.Z(),r.K(e.resumeToken));break;case 4:this.ce(t)&&(this.le(t),r.K(e.resumeToken));break;default:B(56790,{state:e.state})}else k(Os,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ee.forEach(((r,s)=>{this.ce(s)&&t(s)}))}Ee(e){var t;return mn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:Hc(e)}he(e){const t=e.targetId,r=e.M.count,s=this.Te(t);if(s){const i=s.target;if(this.Ee(i))if(r===0){const o=new F(mn(i)?ee.fromString(i.getPipelineDocuments()[0]):i.path);this.ae(t,o,ge.newNoDocument(o,z.min()))}else L(r===1,20013,"Single document existence filter with count: "+r);else{const o=this.Pe(t);if(o!==r){const u=this.Ie(e),c=u?this.Re(u,e,o):1;if(c!==0){this.le(t);const l=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.se=this.se.insert(t,l)}}}}}Ie(e){const t=e.M.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,u;try{o=Gt(r).toUint8Array()}catch(c){if(c instanceof am)return ft("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{u=new Wc(o,s,i)}catch(c){return ft(c instanceof Gs?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return u.p===0?null:u}Re(e,t,r){return t.M.count===r-this.de(e,t.targetId)?0:2}de(e,t){const r=this.X.getRemoteKeysForTarget(t);let s=0;return r.forEach((i=>{const o=this.X.Ve(),u=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(u)||(this.ae(t,i,null),s++)})),s}fe(e){const t=new Map;this.ee.forEach(((i,o)=>{const u=this.Te(o);if(u){if(i.current&&this.Ee(u.target)){const c=mn(u.target)?ee.fromString(u.target.getPipelineDocuments()[0]):u.target.path,l=new F(c);this.me(l).has(o)||this.pe(o,l)||this.ae(o,l,ge.newNoDocument(l,e))}i.$&&(t.set(o,i.W()),i.G())}}));let r=Y();this.ie.forEach(((i,o)=>{let u=!0;o.forEachWhile((c=>{const l=this.Te(c);return!l||l.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)})),u&&(r=r.add(i))})),this.te.forEach(((i,o)=>o.setReadTime(e))),this.re.forEach(((i,o)=>o.setReadTime(e)));const s=new qi(e,t,this.se,this.te,this.re,r);return this.te=ve(),this.ne=To(),this.re=ve(),this.ie=To(),this.se=new le(K),s}oe(e,t){const r=this.ee.get(e);if(!r||!this.ce(e))return void k(Os,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.pe(e,t.key)?2:0;r.j(t.key,s),mn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t.key,t):this.te=this.te.insert(t.key,t),this.ne=this.ne.insert(t.key,this.me(t.key).add(e)),this.ie=this.ie.insert(t.key,this.ge(t.key).add(e))}ae(e,t,r){const s=this.ee.get(e);s&&this.ce(e)?(this.pe(e,t)?s.j(t,1):s.H(t),this.ie=this.ie.insert(t,this.ge(t).delete(e)),this.ie=this.ie.insert(t,this.ge(t).add(e)),r&&(mn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t,r):this.te=this.te.insert(t,r))):k(Os,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.ee.delete(e)}Pe(e){const t=this.ee.get(e);if(!t)return 0;const r=t.W();return this.X.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}J(e){let t=this.ee.get(e);t||(k(Os,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Qd(e),this.ee.set(e,t)),t.J()}ge(e){let t=this.ie.get(e);return t||(t=new ie(K),this.ie=this.ie.insert(e,t)),t}me(e){let t=this.ne.get(e);return t||(t=new ie(K),this.ne=this.ne.insert(e,t)),t}ce(e){const t=this.Te(e)!==null;return t||k(Os,"Detected inactive target",e),t}Te(e){const t=this.ee.get(e);return t===void 0||t.q?null:this.X.ye(e)}le(e){this.ee.set(e,new Qd(e)),this.X.getRemoteKeysForTarget(e).forEach((t=>{this.ae(e,t,null)}))}pe(e,t){return this.X.getRemoteKeysForTarget(e).has(t)}}function To(){return new le(F.comparator)}function Yd(){return new le(F.comparator)}const qw={asc:"ASCENDING",desc:"DESCENDING"},$w={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},jw={and:"AND",or:"OR"};class zw{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function rc(n,e){return n.useProto3Json||Sa(e)?e:{value:e}}function sr(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Qc(n){const e=zt(n);return new se(e.seconds,e.nanos)}function Um(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Fo(n,e){return sr(n,e.toTimestamp())}function He(n){return L(!!n,49232),z.fromTimestamp(Qc(n))}function Yc(n,e){return sc(n,e).canonicalString()}function sc(n,e){const t=(function(s){return new ee(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function Fm(n){const e=ee.fromString(n);return L(Qm(e),10190,{key:e.toString()}),e}function Ii(n,e){return Yc(n.databaseId,e.path)}function ir(n,e){const t=Fm(e);if(t.get(1)!==n.databaseId.projectId)throw new O(C.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new O(C.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new F($m(t))}function Bm(n,e){return Yc(n.databaseId,e)}function qm(n){const e=Fm(n);return e.length===4?ee.emptyPath():$m(e)}function ic(n){return new ee(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function $m(n){return L(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Xd(n,e,t){return{name:Ii(n,e),fields:t.value.mapValue.fields}}function Gw(n,e,t){const r=ir(n,e.name),s=He(e.updateTime),i=e.createTime?He(e.createTime):z.min(),o=new ke({mapValue:{fields:e.fields}}),u=ge.newFoundDocument(r,s,i,o);return t&&u.setHasCommittedMutations(),t?u.setHasCommittedMutations():u}function Hw(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(l){return l==="NO_CHANGE"?0:l==="ADD"?1:l==="REMOVE"?2:l==="CURRENT"?3:l==="RESET"?4:B(39313,{state:l})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(l,f){return l.useProto3Json?(L(f===void 0||typeof f=="string",58123),fe.fromBase64String(f||"")):(L(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),fe.fromUint8Array(f||new Uint8Array))})(n,e.targetChange.resumeToken),o=e.targetChange.cause,u=o&&(function(l){const f=l.code===void 0?C.UNKNOWN:Nm(l.code);return new O(f,l.message||"")})(o);t=new Mm(r,s,i,u||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=ir(n,r.document.name),i=He(r.document.updateTime),o=r.document.createTime?He(r.document.createTime):z.min(),u=new ke({mapValue:{fields:r.document.fields}}),c=ge.newFoundDocument(s,i,o,u),l=r.targetIds||[],f=r.removedTargetIds||[];t=new Uo(l,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=ir(n,r.document),i=r.readTime?He(r.readTime):z.min(),o=ge.newNoDocument(s,i),u=r.removedTargetIds||[];t=new Uo([],u,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=ir(n,r.document),i=r.removedTargetIds||[];t=new Uo([],i,s,null)}else{if(!("filter"in e))return B(11601,{we:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new xw(s,i),u=r.targetId;t=new Lm(u,o)}}return t}function oa(n,e){let t;if(e instanceof fs)t={update:Xd(n,e.key,e.value)};else if(e instanceof Fi)t={delete:Ii(n,e.key)};else if(e instanceof Qt)t={update:Xd(n,e.key,e.data),updateMask:Jw(e.fieldMask)};else{if(!(e instanceof wm))return B(16599,{be:e.type});t={verify:Ii(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(i,o){const u=o.transform;if(u instanceof ts)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof ns)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof rs)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof Ir)return{fieldPath:o.field.canonicalString(),increment:u.h};if(u instanceof pi)return{fieldPath:o.field.canonicalString(),minimum:u.h};if(u instanceof mi)return{fieldPath:o.field.canonicalString(),maximum:u.h};throw B(20930,{transform:o.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:Fo(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:B(27497)})(n,e.precondition)),t}function oc(n,e){const t=e.currentDocument?(function(i){return i.updateTime!==void 0?Ce.updateTime(He(i.updateTime)):i.exists!==void 0?Ce.exists(i.exists):Ce.none()})(e.currentDocument):Ce.none(),r=e.updateTransforms?e.updateTransforms.map((s=>(function(o,u){let c=null;if("setToServerValue"in u)L(u.setToServerValue==="REQUEST_TIME",16630,{proto:u}),c=new ts;else if("appendMissingElements"in u){const f=u.appendMissingElements.values||[];c=new ns(f)}else if("removeAllFromArray"in u){const f=u.removeAllFromArray.values||[];c=new rs(f)}else"increment"in u?c=new Ir(o,u.increment):"minimum"in u?c=new pi(o,u.minimum):"maximum"in u?c=new mi(o,u.maximum):B(16584,{proto:u});const l=Ae.fromServerFormat(u.fieldPath);return new $c(l,c)})(n,s))):[];if(e.update){e.update.name;const s=ir(n,e.update.name),i=new ke({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=(function(c){const l=c.fieldPaths||[];return new Ye(l.map((f=>Ae.fromServerFormat(f))))})(e.updateMask);return new Qt(s,i,o,t,r)}return new fs(s,i,t,r)}if(e.delete){const s=ir(n,e.delete);return new Fi(s,t)}if(e.verify){const s=ir(n,e.verify);return new wm(s,t)}return B(1463,{proto:e})}function Kw(n,e){return n&&n.length>0?(L(e!==void 0,14353),n.map((t=>(function(s,i){let o=s.updateTime?He(s.updateTime):He(i);return o.isEqual(z.min())&&(o=He(i)),new fw(o,s.transformResults||[])})(t,e)))):[]}function jm(n,e){return{documents:[Bm(n,e.path)]}}function zm(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Bm(n,s);const i=(function(l){if(l.length!==0)return Wm(oe.create(l,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(l){if(l.length!==0)return l.map((f=>(function(g){return{field:Gr(g.field),direction:Qw(g.dir)}})(f)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const u=rc(n,e.limit);return u!==null&&(t.structuredQuery.limit=u),e.startAt&&(t.structuredQuery.startAt=(function(l){return{before:l.inclusive,values:l.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(l){return{before:!l.inclusive,values:l.position}})(e.endAt)),{Se:t,parent:s}}function Gm(n){let e=qm(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){L(r===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=(function(p){const g=Km(p);return g instanceof oe&&jc(g)?g.getFilters():[g]})(t.where));let o=[];t.orderBy&&(o=(function(p){return p.map((g=>(function(S){return new gi(Hr(S.field),(function(N){switch(N){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(S.direction))})(g)))})(t.orderBy));let u=null;t.limit&&(u=(function(p){let g;return g=typeof p=="object"?p.value:p,Sa(g)?null:g})(t.limit));let c=null;t.startAt&&(c=(function(p){const g=!!p.before,A=p.values||[];return new ss(A,g)})(t.startAt));let l=null;return t.endAt&&(l=(function(p){const g=!p.before,A=p.values||[];return new ss(A,g)})(t.endAt)),Rw(e,s,o,i,u,"F",c,l)}function Ww(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return B(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Hm(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function Km(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Hr(t.unaryFilter.field);return ne.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Hr(t.unaryFilter.field);return ne.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Hr(t.unaryFilter.field);return ne.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Hr(t.unaryFilter.field);return ne.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return B(61313);default:return B(60726)}})(n):n.fieldFilter!==void 0?(function(t){return ne.create(Hr(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return B(58110);default:return B(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return oe.create(t.compositeFilter.filters.map((r=>Km(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return B(1026)}})(t.compositeFilter.op))})(n):B(30097,{filter:n})}function Qw(n){return qw[n]}function Yw(n){return $w[n]}function Xw(n){return jw[n]}function Gr(n){return{fieldPath:n.canonicalString()}}function Hr(n){return Ae.fromServerFormat(n.fieldPath)}function Wm(n){return n instanceof ne?(function(t){if(t.op==="=="){if(et(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NAN"}};if(st(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(et(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NOT_NAN"}};if(st(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Gr(t.field),op:Yw(t.op),value:t.value}}})(n):n instanceof oe?(function(t){const r=t.getFilters().map((s=>Wm(s)));return r.length===1?r[0]:{compositeFilter:{op:Xw(t.op),filters:r}}})(n):B(54877,{filter:n})}function Jw(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function Qm(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function Ym(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function Ti(n,e){const t={fields:{}};return e.forEach(((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)})),{mapValue:t}}function Xm(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Da(n){return new zw(n,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ct(fe.fromBase64String(e))}catch(t){throw new O(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new ct(fe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:ct._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Mi(e,ct._jsonSchema))return ct.fromBase64String(e.bytes)}}ct._jsonSchemaVersion="firestore/bytes/1.0",ct._jsonSchema={type:Te("string",ct._jsonSchemaVersion),bytes:Te("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oa{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new O(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ae(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function Zw(){return new Oa(Et)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ji{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return K(this._lat,e._lat)||K(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Ct._jsonSchemaVersion}}static fromJSON(e){if(Mi(e,Ct._jsonSchema))return new Ct(e.latitude,e.longitude)}}Ct._jsonSchemaVersion="firestore/geoPoint/1.0",Ct._jsonSchema={type:Te("string",Ct._jsonSchemaVersion),latitude:Te("number"),longitude:Te("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ne.UNAUTHENTICATED=new Ne(null),Ne.GOOGLE_CREDENTIALS=new Ne("google-credentials-uid"),Ne.FIRST_PARTY=new Ne("first-party-uid"),Ne.MOCK_USER=new Ne("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jm{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class ev{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Ne.UNAUTHENTICATED)))}shutdown(){}}class tv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class nv{constructor(e){this.De=e,this.currentUser=Ne.UNAUTHENTICATED,this.xe=0,this.forceRefresh=!1,this.auth=null}start(e,t){L(this.Ce===void 0,42304);let r=this.xe;const s=c=>this.xe!==r?(r=this.xe,t(c)):Promise.resolve();let i=new xt;this.Ce=()=>{this.xe++,this.currentUser=this.Fe(),i.resolve(),i=new xt,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const c=i;e.enqueueRetryable((async()=>{await c.promise,await s(this.currentUser)}))},u=c=>{k("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.Ce&&(this.auth.addAuthTokenListener(this.Ce),o())};this.De.onInit((c=>u(c))),setTimeout((()=>{if(!this.auth){const c=this.De.getImmediate({optional:!0});c?u(c):(k("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new xt)}}),0),o()}getToken(){const e=this.xe,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.xe!==e?(k("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(L(typeof r.accessToken=="string",31837,{Oe:r}),new Jm(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.Ce&&this.auth.removeAuthTokenListener(this.Ce),this.Ce=void 0}Fe(){const e=this.auth&&this.auth.getUid();return L(e===null||typeof e=="string",2055,{Me:e}),new Ne(e)}}class rv{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r,this.type="FirstParty",this.user=Ne.FIRST_PARTY,this.Ue=new Map}ke(){return this.Be?this.Be():null}get headers(){this.Ue.set("X-Goog-AuthUser",this.Ne);const e=this.ke();return e&&this.Ue.set("Authorization",e),this.Le&&this.Ue.set("X-Goog-Iam-Authorization-Token",this.Le),this.Ue}}class sv{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r}getToken(){return Promise.resolve(new rv(this.Ne,this.Le,this.Be))}start(e,t){e.enqueueRetryable((()=>t(Ne.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Jd{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class iv{constructor(e,t){this.qe=t,this.forceRefresh=!1,this.appCheck=null,this.$e=null,this.Ke=null,Qe(e)&&e.settings.appCheckToken&&(this.Ke=e.settings.appCheckToken)}start(e,t){L(this.Ce===void 0,3512);const r=i=>{i.error!=null&&k("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.$e;return this.$e=i.token,k("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.Ce=i=>{e.enqueueRetryable((()=>r(i)))};const s=i=>{k("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.Ce&&this.appCheck.addTokenListener(this.Ce)};this.qe.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.qe.getImmediate({optional:!0});i?s(i):k("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.Ke)return Promise.resolve(new Jd(this.Ke));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(L(typeof t.token=="string",44558,{tokenResult:t}),this.$e=t.token,new Jd(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.Ce&&this.appCheck.removeTokenListener(this.Ce),this.Ce=void 0}}function Zm(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ov{Qe(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zd="ConnectivityMonitor";class ef{constructor(){this.We=()=>this.Ge(),this.ze=()=>this.je(),this.He=[],this.Je()}Qe(e){this.He.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.ze)}Je(){window.addEventListener("online",this.We),window.addEventListener("offline",this.ze)}Ge(){k(Zd,"Network connectivity changed: AVAILABLE");for(const e of this.He)e(0)}je(){k(Zd,"Network connectivity changed: UNAVAILABLE");for(const e of this.He)e(1)}static Ye(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Eo=null;function ac(){return Eo===null?Eo=(function(){return 268435456+Math.round(2147483648*Math.random())})():Eo++,"0x"+Eo.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xu="RestConnection",av={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class uv{get Ze(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Xe=t+"://"+e.host,this.et=`projects/${r}/databases/${s}`,this.tt=this.databaseId.database===ea?`project_id=${r}`:`project_id=${r}&database_id=${s}`}nt(e,t,r,s,i){const o=ac(),u=this.rt(e,t.toUriEncodedString());k(xu,`Sending RPC '${e}' ${o}:`,u,r);const c={"google-cloud-resource-prefix":this.et,"x-goog-request-params":this.tt};this.it(c,s,i);const{host:l}=new URL(u),f=vr(l);return this.st(e,u,c,r,f).then((p=>(k(xu,`Received RPC '${e}' ${o}: `,p),p)),(p=>{throw ft(xu,`RPC '${e}' ${o} failed with error: `,p,"url: ",u,"request:",r),p}))}_t(e,t,r,s,i,o){return this.nt(e,t,r,s,i)}it(e,t,r){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+ds})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),r&&r.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}rt(e,t){const r=av[e];let s=`${this.Xe}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cv{constructor(e){this.ot=e.ot,this.ut=e.ut}ct(e){this.lt=e}Et(e){this.ht=e}Tt(e){this.Pt=e}onMessage(e){this.It=e}close(){this.ut()}send(e){this.ot(e)}Rt(){this.lt()}At(){this.ht()}Vt(e){this.Pt(e)}dt(e){this.It(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Le="WebChannelConnection",Ls=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Yr extends uv{constructor(e){super(e),this.ft=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static gt(){if(!Yr.yt){const e=tm();Ls(e,em.STAT_EVENT,(t=>{t.stat===Wu.PROXY?k(Le,"STAT_EVENT: detected buffering proxy"):t.stat===Wu.NOPROXY&&k(Le,"STAT_EVENT: detected no buffering proxy")})),Yr.yt=!0}}st(e,t,r,s,i){const o=ac();return new Promise(((u,c)=>{const l=new Jp;l.setWithCredentials(!0),l.listenOnce(Zp.COMPLETE,(()=>{try{switch(l.getLastErrorCode()){case Do.NO_ERROR:const p=l.getResponseJson();k(Le,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),u(p);break;case Do.TIMEOUT:k(Le,`RPC '${e}' ${o} timed out`),c(new O(C.DEADLINE_EXCEEDED,"Request time out"));break;case Do.HTTP_ERROR:const g=l.getStatus();if(k(Le,`RPC '${e}' ${o} failed with status:`,g,"response text:",l.getResponseText()),g>0){let A=l.getResponseJson();Array.isArray(A)&&(A=A[0]);const S=A==null?void 0:A.error;if(S&&S.status&&S.message){const D=(function($){const j=$.toLowerCase().replace(/_/g,"-");return Object.values(C).indexOf(j)>=0?j:C.UNKNOWN})(S.status);c(new O(D,S.message))}else c(new O(C.UNKNOWN,"Server responded with status "+l.getStatus()))}else c(new O(C.UNAVAILABLE,"Connection failed."));break;default:B(9055,{wt:e,streamId:o,bt:l.getLastErrorCode(),St:l.getLastError()})}}finally{k(Le,`RPC '${e}' ${o} completed.`)}}));const f=JSON.stringify(s);k(Le,`RPC '${e}' ${o} sending request:`,s),l.send(t,"POST",f,r,15)}))}vt(e,t,r){const s=ac(),i=[this.Xe,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(u.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(u.useFetchStreams=!0),this.it(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;const l=i.join("");k(Le,`Creating RPC '${e}' stream ${s}: ${l}`,u);const f=o.createWebChannel(l,u);this.Dt(f);let p=!1,g=!1;const A=new cv({ot:S=>{g?k(Le,`Not sending because RPC '${e}' stream ${s} is closed:`,S):(p||(k(Le,`Opening RPC '${e}' stream ${s} transport.`),f.open(),p=!0),k(Le,`RPC '${e}' stream ${s} sending:`,S),f.send(S))},ut:()=>f.close()});return Ls(f,zs.EventType.OPEN,(()=>{g||(k(Le,`RPC '${e}' stream ${s} transport opened.`),A.Rt())})),Ls(f,zs.EventType.CLOSE,(()=>{g||(g=!0,k(Le,`RPC '${e}' stream ${s} transport closed`),A.Vt(),this.xt(f))})),Ls(f,zs.EventType.ERROR,(S=>{g||(g=!0,ft(Le,`RPC '${e}' stream ${s} transport errored. Name:`,S.name,"Message:",S.message),A.Vt(new O(C.UNAVAILABLE,"The operation could not be completed")))})),Ls(f,zs.EventType.MESSAGE,(S=>{var D;if(!g){const N=S.data[0];L(!!N,16349);const $=N,j=($==null?void 0:$.error)||((D=$[0])==null?void 0:D.error);if(j){k(Le,`RPC '${e}' stream ${s} received error:`,j);const q=j.status;let Q=(function(T){const _=ye[T];if(_!==void 0)return Nm(_)})(q),X=j.message;q==="NOT_FOUND"&&X.includes("database")&&X.includes("does not exist")&&X.includes(this.databaseId.database)&&ft(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),Q===void 0&&(Q=C.INTERNAL,X="Unknown error status: "+q+" with message "+j.message),g=!0,A.Vt(new O(Q,X)),f.close()}else k(Le,`RPC '${e}' stream ${s} received:`,N),A.dt(N)}})),Yr.gt(),setTimeout((()=>{A.At()}),0),A}terminate(){this.ft.forEach((e=>e.close())),this.ft=[]}Dt(e){this.ft.push(e)}xt(e){this.ft=this.ft.filter((t=>t===e))}it(e,t,r){super.it(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return nm()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lv(n){return new Yr(n)}Yr.yt=!1;class eg{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Ct=e,this.timerId=t,this.Ft=r,this.Ot=s,this.Mt=i,this.Nt=0,this.Lt=null,this.Bt=Date.now(),this.reset()}reset(){this.Nt=0}Ut(){this.Nt=this.Mt}kt(e){this.cancel();const t=Math.floor(this.Nt+this.qt()),r=Math.max(0,Date.now()-this.Bt),s=Math.max(0,t-r);s>0&&k("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Nt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Lt=this.Ct.enqueueAfterDelay(this.timerId,s,(()=>(this.Bt=Date.now(),e()))),this.Nt*=this.Ot,this.Nt<this.Ft&&(this.Nt=this.Ft),this.Nt>this.Mt&&(this.Nt=this.Mt)}$t(){this.Lt!==null&&(this.Lt.skipDelay(),this.Lt=null)}cancel(){this.Lt!==null&&(this.Lt.cancel(),this.Lt=null)}qt(){return(Math.random()-.5)*this.Nt}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tf="PersistentStream";class tg{constructor(e,t,r,s,i,o,u,c){this.Ct=e,this.Kt=r,this.Qt=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=u,this.listener=c,this.state=0,this.Wt=0,this.Gt=null,this.zt=null,this.stream=null,this.jt=0,this.Ht=new eg(e,t)}Jt(){return this.state===1||this.state===5||this.Yt()}Yt(){return this.state===2||this.state===3}start(){this.jt=0,this.state!==4?this.auth():this.Zt()}async stop(){this.Jt()&&await this.close(0)}Xt(){this.state=0,this.Ht.reset()}en(){this.Yt()&&this.Gt===null&&(this.Gt=this.Ct.enqueueAfterDelay(this.Kt,6e4,(()=>this.tn())))}nn(e){this.rn(),this.stream.send(e)}async tn(){if(this.Yt())return this.close(0)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}sn(){this.zt&&(this.zt.cancel(),this.zt=null)}async close(e,t){this.rn(),this.sn(),this.Ht.cancel(),this.Wt++,e!==4?this.Ht.reset():t&&t.code===C.RESOURCE_EXHAUSTED?(Ge(t.toString()),Ge("Using maximum backoff delay to prevent overloading the backend."),this.Ht.Ut()):t&&t.code===C.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this._n(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Tt(t)}_n(){}auth(){this.state=1;const e=this.an(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.Wt===t&&this.un(r,s)}),(r=>{e((()=>{const s=new O(C.UNKNOWN,"Fetching auth token failed: "+r.message);return this.cn(s)}))}))}un(e,t){const r=this.an(this.Wt);this.stream=this.En(e,t),this.stream.ct((()=>{r((()=>this.listener.ct()))})),this.stream.Et((()=>{r((()=>(this.state=2,this.zt=this.Ct.enqueueAfterDelay(this.Qt,1e4,(()=>(this.Yt()&&(this.state=3),Promise.resolve()))),this.listener.Et())))})),this.stream.Tt((s=>{r((()=>this.cn(s)))})),this.stream.onMessage((s=>{r((()=>++this.jt==1?this.hn(s):this.onNext(s)))}))}Zt(){this.state=5,this.Ht.kt((async()=>{this.state=0,this.start()}))}cn(e){return k(tf,`close with error: ${e}`),this.stream=null,this.close(4,e)}an(e){return t=>{this.Ct.enqueueAndForget((()=>this.Wt===e?t():(k(tf,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class hv extends tg{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}En(e,t){return this.connection.vt("Listen",e,t)}hn(e){return this.onNext(e)}onNext(e){this.Ht.reset();const t=Hw(this.serializer,e),r=(function(i){if(!("targetChange"in i))return z.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?z.min():o.readTime?He(o.readTime):z.min()})(e);return this.listener.Tn(t,r)}Pn(e){const t={};t.database=ic(this.serializer),t.addTarget=(function(i,o){let u;const c=o.target;if(u=mn(c)?{pipelineQuery:Hm(i,c)}:Hc(c)?{documents:jm(i,c)}:{query:zm(i,c).Se},u.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){u.resumeToken=Um(i,o.resumeToken);const l=rc(i,o.expectedCount);l!==null&&(u.expectedCount=l)}else if(o.snapshotVersion.compareTo(z.min())>0){u.readTime=sr(i,o.snapshotVersion.toTimestamp());const l=rc(i,o.expectedCount);l!==null&&(u.expectedCount=l)}return u})(this.serializer,e);const r=Ww(this.serializer,e);r&&(t.labels=r),this.nn(t)}In(e){const t={};t.database=ic(this.serializer),t.removeTarget=e,this.nn(t)}}class dv extends tg{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get Rn(){return this.jt>0}start(){this.lastStreamToken=void 0,super.start()}_n(){this.Rn&&this.An([])}En(e,t){return this.connection.vt("Write",e,t)}hn(e){return L(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,L(!e.writeResults||e.writeResults.length===0,55816),this.listener.Vn()}onNext(e){L(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.Ht.reset();const t=Kw(e.writeResults,e.commitTime),r=He(e.commitTime);return this.listener.dn(r,t)}fn(){const e={};e.database=ic(this.serializer),this.nn(e)}An(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>oa(this.serializer,r)))};this.nn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fv{}class pv extends fv{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.mn=!1}pn(){if(this.mn)throw new O(C.FAILED_PRECONDITION,"The client has already been terminated.")}nt(e,t,r,s){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.nt(e,sc(t,r),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new O(C.UNKNOWN,i.toString())}))}_t(e,t,r,s,i){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,u])=>this.connection._t(e,sc(t,r),s,o,u,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new O(C.UNKNOWN,o.toString())}))}terminate(){this.mn=!0,this.connection.terminate()}}function mv(n,e,t,r){return new pv(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gv="ComponentProvider",nf=new Map;function _v(n,e,t,r,s){return new sw(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,Zm(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rf={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ng=41943040;class Me{static withCacheSize(e){return new Me(e,Me.DEFAULT_COLLECTION_PERCENTILE,Me.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}Me.DEFAULT_COLLECTION_PERCENTILE=10,Me.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Me.DEFAULT=new Me(ng,Me.DEFAULT_COLLECTION_PERCENTILE,Me.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Me.DISABLED=new Me(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.gn(r),this.yn=r=>t.writeSequenceNumber(r))}gn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.yn&&this.yn(e),e}}lt.wn=-1;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rg="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class sg{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Rr(n){if(n.code!==C.FAILED_PRECONDITION||n.message!==rg)throw n;k("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&B(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new R(((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof R?t:R.resolve(t)}catch(t){return R.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):R.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):R.reject(t)}static resolve(e){return new R(((t,r)=>{t(e)}))}static reject(e){return new R(((t,r)=>{r(e)}))}static waitFor(e){return new R(((t,r)=>{let s=0,i=0,o=!1;e.forEach((u=>{++s,u.next((()=>{++i,o&&i===s&&t()}),(c=>r(c)))})),o=!0,i===s&&t()}))}static or(e){let t=R.resolve(!1);for(const r of e)t=t.next((s=>s?R.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,i)=>{r.push(t.call(this,s,i))})),this.waitFor(r)}static mapArray(e,t){return new R(((r,s)=>{const i=e.length,o=new Array(i);let u=0;for(let c=0;c<i;c++){const l=c;t(e[l]).next((f=>{o[l]=f,++u,u===i&&r(o)}),(f=>s(f)))}}))}static doWhile(e,t){return new R(((r,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):r()};i()}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rt="SimpleDb";class La{static open(e,t,r,s){try{return new La(t,e.transaction(s,r))}catch(i){throw new ti(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.bn=new xt,this.transaction.oncomplete=()=>{this.bn.resolve()},this.transaction.onabort=()=>{t.error?this.bn.reject(new ti(e,t.error)):this.bn.resolve()},this.transaction.onerror=r=>{const s=Xc(r.target.error);this.bn.reject(new ti(e,s))}}get Sn(){return this.bn.promise}abort(e){e&&this.bn.reject(e),this.aborted||(k(rt,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}vn(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new Iv(t)}}class Tn{static delete(e){return k(rt,"Removing database:",e),Kn(sp().indexedDB.deleteDatabase(e)).toPromise()}static Ye(){if(!pp())return!1;if(Tn.Dn())return!0;const e=Re(),t=Tn.xn(e),r=0<t&&t<10,s=ig(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||i)}static Dn(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static Cn(e,t){return e.store(t)}static xn(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}constructor(e,t,r){this.name=e,this.version=t,this.Fn=r,this.On=null,Tn.xn(Re())===12.2&&Ge("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async Mn(e){return this.db||(k(rt,"Opening database:",this.name),this.db=await new Promise(((t,r)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{r(new ti(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?r(new O(C.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new O(C.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new ti(e,o))},s.onupgradeneeded=i=>{k(rt,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.Fn.Nn(o,s.transaction,i.oldVersion,this.version).next((()=>{k(rt,"Database upgrade to version "+this.version+" complete")}))}}))),this.Ln&&(this.db.onversionchange=t=>this.Ln(t)),this.db}Bn(e){this.Ln=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,r,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.Mn(e);const u=La.open(this.db,e,i?"readonly":"readwrite",r),c=s(u).next((l=>(u.vn(),l))).catch((l=>(u.abort(l),R.reject(l)))).toPromise();return c.catch((()=>{})),await u.Sn,c}catch(u){const c=u,l=c.name!=="FirebaseError"&&o<3;if(k(rt,"Transaction failed with error:",c.message,"Retrying:",l),this.close(),!l)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}function ig(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class yv{constructor(e){this.Un=e,this.kn=!1,this.qn=null}get isDone(){return this.kn}get $n(){return this.qn}set cursor(e){this.Un=e}done(){this.kn=!0}Kn(e){this.qn=e}delete(){return Kn(this.Un.delete())}}class ti extends O{constructor(e,t){super(C.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Mn(n){return n.name==="IndexedDbTransactionError"}class Iv{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(k(rt,"PUT",this.store.name,e,t),r=this.store.put(t,e)):(k(rt,"PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),Kn(r)}add(e){return k(rt,"ADD",this.store.name,e,e),Kn(this.store.add(e))}get(e){return Kn(this.store.get(e)).next((t=>(t===void 0&&(t=null),k(rt,"GET",this.store.name,e,t),t)))}delete(e){return k(rt,"DELETE",this.store.name,e),Kn(this.store.delete(e))}count(){return k(rt,"COUNT",this.store.name),Kn(this.store.count())}Qn(e,t){const r=this.options(e,t),s=r.index?this.store.index(r.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(r.range);return new R(((o,u)=>{i.onerror=c=>{u(c.target.error)},i.onsuccess=c=>{o(c.target.result)}}))}{const i=this.cursor(r),o=[];return this.Wn(i,((u,c)=>{o.push(c)})).next((()=>o))}}Gn(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new R(((s,i)=>{r.onerror=o=>{i(o.target.error)},r.onsuccess=o=>{s(o.target.result)}}))}zn(e,t){k(rt,"DELETE ALL",this.store.name);const r=this.options(e,t);r.jn=!1;const s=this.cursor(r);return this.Wn(s,((i,o,u)=>u.delete()))}Hn(e,t){let r;t?r=e:(r={},t=e);const s=this.cursor(r);return this.Wn(s,t)}Jn(e){const t=this.cursor({});return new R(((r,s)=>{t.onerror=i=>{const o=Xc(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next((u=>{u?o.continue():r()})):r()}}))}Wn(e,t){const r=[];return new R(((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const u=o.target.result;if(!u)return void s();const c=new yv(u),l=t(u.primaryKey,u.value,c);if(l instanceof R){const f=l.catch((p=>(c.done(),R.reject(p))));r.push(f)}c.isDone?s():c.$n===null?u.continue():u.continue(c.$n)}})).next((()=>R.waitFor(r)))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.jn?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Kn(n){return new R(((e,t)=>{n.onsuccess=r=>{const s=r.target.result;e(s)},n.onerror=r=>{const s=Xc(r.target.error);t(s)}}))}let sf=!1;function Xc(n){const e=Tn.xn(Re());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new O("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return sf||(sf=!0,setTimeout((()=>{throw r}),0)),r}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const of="LruGarbageCollector",Tv=1048576;function af([n,e],[t,r]){const s=K(n,t);return s===0?K(e,r):s}class Ev{constructor(e){this.Yn=e,this.buffer=new ie(af),this.Zn=0}Xn(){return++this.Zn}er(e){const t=[e,this.Xn()];if(this.buffer.size<this.Yn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();af(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class og{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.tr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.nr(6e4)}stop(){this.tr&&(this.tr.cancel(),this.tr=null)}get started(){return this.tr!==null}nr(e){k(of,`Garbage collection scheduled in ${e}ms`),this.tr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.tr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Mn(t)?k(of,"Ignoring IndexedDB error during garbage collection: ",t):await Rr(t)}await this.nr(3e5)}))}}class wv{constructor(e,t){this.rr=e,this.params=t}calculateTargetCount(e,t){return this.rr.ir(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return R.resolve(lt.wn);const r=new Ev(t);return this.rr.forEachTarget(e,(s=>r.er(s.sequenceNumber))).next((()=>this.rr.sr(e,(s=>r.er(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.rr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.rr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(k("LruGarbageCollector","Garbage collection skipped; disabled"),R.resolve(rf)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(k("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),rf):this._r(e,t)))}getCacheSize(e){return this.rr.getCacheSize(e)}_r(e,t){let r,s,i,o,u,c,l;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((p=>(p>this.params.maximumSequenceNumbersToCollect?(k("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,o=Date.now(),this.nthSequenceNumber(e,s)))).next((p=>(r=p,u=Date.now(),this.removeTargets(e,r,t)))).next((p=>(i=p,c=Date.now(),this.removeOrphanedDocuments(e,r)))).next((p=>(l=Date.now(),$r()<=te.DEBUG&&k("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(u-o)+`ms
	Removed ${i} targets in `+(c-u)+`ms
	Removed ${p} documents in `+(l-c)+`ms
Total Duration: ${l-f}ms`),R.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:p}))))}}function ag(n,e){return new wv(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ug="firestore.googleapis.com",uf=!0;class cf{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new O(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=ug,this.ssl=uf}else this.host=e.host,this.ssl=e.ssl??uf;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=ng;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Tv)throw new O(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(nw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Zm(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new O(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new O(C.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(r,s){if(r===s)return!0;if(!r||!s)return!1;const i=Object.keys(r),o=Object.keys(s);if(i.length!==o.length)return!1;for(const u of i)if(r[u]!==s[u])return!1;return!0})(this._customHeaders,e._customHeaders)}}let Ma=class{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new cf({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new O(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new cf(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new ev;switch(r.type){case"firstParty":return new sv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new O(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=nf.get(t);r&&(k(gv,"Removing Datastore"),nf.delete(t),r.terminate())})(this),Promise.resolve()}};function vv(n,e,t,r={}){var l;n=Xe(n,Ma);const s=vr(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},u=`${e}:${t}`;s&&Ac(`https://${u}`),i.host!==ug&&i.host!==u&&ft("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...i,host:u,ssl:s,emulatorOptions:r};if(!hr(c,o)&&(n._setSettings(c),r.mockUserToken)){let f,p;if(typeof r.mockUserToken=="string")f=r.mockUserToken,p=Ne.MOCK_USER;else{f=lp(r.mockUserToken,(l=n._app)==null?void 0:l.options.projectId);const g=r.mockUserToken.sub||r.mockUserToken.user_id;if(!g)throw new O(C.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Ne(g)}n._authCredentials=new tv(new Jm(f,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Xt(this.firestore,e,this._query)}}class _e{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new En(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new _e(this.firestore,e,this._key)}toJSON(){return{type:_e._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Mi(t,_e._jsonSchema))return new _e(e,r||null,new F(ee.fromString(t.referencePath)))}}_e._jsonSchemaVersion="firestore/documentReference/1.0",_e._jsonSchema={type:Te("string",_e._jsonSchemaVersion),referencePath:Te("string")};class En extends Xt{constructor(e,t,r){super(e,t,Bi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new _e(this.firestore,null,new F(e))}withConverter(e){return new En(this.firestore,e,this._path)}}function kS(n,e,...t){if(n=de(n),om("collection","path",e),n instanceof Ma){const r=ee.fromString(e,...t);return xd(r),new En(n,null,r)}{if(!(n instanceof _e||n instanceof En))throw new O(C.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return xd(r),new En(n.firestore,null,r)}}function Av(n,e,...t){if(n=de(n),arguments.length===1&&(e=Mc.newId()),om("doc","path",e),n instanceof Ma){const r=ee.fromString(e,...t);return Cd(r),new _e(n,null,new F(r))}{if(!(n instanceof _e||n instanceof En))throw new O(C.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ee.fromString(e,...t));return Cd(r),new _e(n.firestore,n instanceof En?n.converter:null,new F(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Je._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Mi(e,Je._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new Je(e.vectorValues);throw new O(C.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Je._jsonSchemaVersion="firestore/vectorValue/1.0",Je._jsonSchema={type:Te("string",Je._jsonSchemaVersion),vectorValues:Te("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rv=/^__.*__$/;class Pv{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Qt(e,this.data,this.fieldMask,t,this.fieldTransforms):new fs(e,this.data,t,this.fieldTransforms)}}class cg{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Qt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function lg(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw B(40011,{dataSource:n})}}class Jc{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Jc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return aa(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(lg(this.dataSource)&&Rv.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class bv{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Da(e)}createContext(e,t,r,s=!1){return new Jc({dataSource:e,methodName:t,targetDoc:r,path:Ae.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ua(n){const e=n._freezeSettings(),t=Da(n._databaseId);return new bv(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Zc(n,e,t,r,s,i={}){const o=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);nl("Data must be an object, but it was:",o,r);const u=hg(r,o);let c,l;if(i.merge)c=new Ye(o.fieldMask),l=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const p of i.mergeFields){const g=Ht(e,p,t);if(!o.contains(g))throw new O(C.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);mg(f,g)||f.push(g)}c=new Ye(f),l=o.fieldTransforms.filter((p=>c.covers(p.field)))}else c=null,l=o.fieldTransforms;return new Pv(new ke(u),c,l)}class Fa extends ji{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Fa}}class el extends ji{_toFieldTransform(e){return new $c(e.path,new ts)}isEqual(e){return e instanceof el}}class tl extends ji{constructor(e,t){super(e),this.ur=t}_toFieldTransform(e){const t=new Ir(e.serializer,Ca(e.serializer,this.ur));return new $c(e.path,t)}isEqual(e){return e instanceof tl&&(this.ur===e.ur||Number.isNaN(this.ur)&&Number.isNaN(e.ur))}}function Sv(n,e,t,r){const s=n.createContext(1,e,t);nl("Data must be an object, but it was:",s,r);const i=[],o=ke.empty();Ln(r,((c,l)=>{const f=pg(e,c,t);l=de(l);const p=s.childContextForFieldPath(f);if(l instanceof Fa)i.push(f);else{const g=bn(l,p);g!=null&&(i.push(f),o.set(f,g))}}));const u=new Ye(i);return new cg(o,u,s.fieldTransforms)}function Vv(n,e,t,r,s,i){const o=n.createContext(1,e,t),u=[Ht(e,r,t)],c=[s];if(i.length%2!=0)throw new O(C.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)u.push(Ht(e,i[g])),c.push(i[g+1]);const l=[],f=ke.empty();for(let g=u.length-1;g>=0;--g)if(!mg(l,u[g])){const A=u[g];let S=c[g];S=de(S);const D=o.childContextForFieldPath(A);if(S instanceof Fa)l.push(A);else{const N=bn(S,D);N!=null&&(l.push(A),f.set(A,N))}}const p=new Ye(l);return new cg(f,p,o.fieldTransforms)}function Cv(n,e,t,r=!1){return bn(t,n.createContext(r?4:3,e))}function bn(n,e,t){if(fg(n=de(n)))return nl("Unsupported field value:",e,n),hg(n,e);if(n instanceof ji)return(function(s,i){if(!lg(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let u=0;for(const c of s){let l=bn(c,i.childContextForArray(u));l==null&&(l={nullValue:"NULL_VALUE"}),o.push(l),u++}return{arrayValue:{values:o}}})(n,e)}return(function(s,i,o){if((s=de(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Ca(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const u=se.fromDate(s);return{timestampValue:sr(i.serializer,u)}}if(s instanceof se){const u=new se(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:sr(i.serializer,u)}}if(dg(s)){const u=se.fromInstant(s),c=new se(u.seconds,1e3*Math.floor(u.nanoseconds/1e3));return{timestampValue:sr(i.serializer,c)}}if(s instanceof Ct)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof ct)return{bytesValue:Um(i.serializer,s._byteString)};if(s instanceof _e){const u=i.databaseId,c=s.firestore._databaseId;if(!c.isEqual(u))throw i.createError(`Document reference is for database ${c.projectId}/${c.database} but should be for database ${u.projectId}/${u.database}`);return{referenceValue:Yc(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof Je)return(function(c,l){const f=c instanceof Je?c.toArray():c;return{mapValue:{fields:{[Uc]:{stringValue:Fc},[_r]:{arrayValue:{values:f.map((g=>{if(typeof g!="number")throw l.createError("VectorValues must only contain numeric values.");return Va(l.serializer,g)}))}}}}}})(s,i);if(Ym(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${Pa(s)}`)})(n,e)}function hg(n,e){const t={};return im(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Ln(n,((r,s)=>{const i=bn(s,e.childContextForField(r));i!=null&&(t[r]=i)})),{mapValue:{fields:t}}}function dg(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal<"u"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const e=n;return e[Symbol.toStringTag]==="Temporal.Instant"&&typeof e.t=="bigint"}function fg(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof se||n instanceof Ct||n instanceof ct||n instanceof _e||n instanceof ji||n instanceof Je||dg(n)||Ym(n))}function nl(n,e,t){if(!fg(t)||!Li(t)){const r=Pa(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Ht(n,e,t){if((e=de(e))instanceof Oa)return e._internalPath;if(typeof e=="string")return pg(n,e);throw aa("Field path arguments must be of type string or ",n,!1,void 0,t)}const xv=new RegExp("[~\\*/\\[\\]]");function pg(n,e,t){if(e.search(xv)>=0)throw aa(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Oa(...e.split("."))._internalPath}catch{throw aa(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function aa(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let u=`Function ${e}() called with invalid data`;t&&(u+=" (via `toFirestore()`)"),u+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${r}`),o&&(c+=` in document ${s}`),c+=")"),new O(C.INVALID_ARGUMENT,u+n+c)}function mg(n,e){return n.some((t=>t.isEqual(e)))}function gg(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=ke.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let u;i.nestedOptions&&Li(o)?u={mapValue:{fields:new qe(i.nestedOptions).getOptionsProto(t,o)}}:o&&(u=bn(o,t)??void 0),u&&r.set(Ae.fromServerFormat(i.serverName),u)}}return r}getOptionsProto(e,t,r){const s=this._getKnownOptions(t,e);if(r){const i=new Map(tw(r,((o,u)=>[Ae.fromServerFormat(u),o!==void 0?bn(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nv(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!Li(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}function DS(){return new el("serverTimestamp")}function OS(n){return new tl("increment",n)}function kv(n){return new Je(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M(n){let e;return n instanceof Pr?n:(e=Li(n)?Uv(n):n instanceof Array?Fv(n):_g(n,void 0),e)}function Nu(n){if(n instanceof Pr)return n;if(n instanceof Je)return Ei(n);if(Array.isArray(n))return Ei(kv(n));throw new Error("Unsupported value: "+typeof n)}function rl(n){return aw(n)?Bo(n):M(n)}class Pr{constructor(){this._protoValueType="ProtoValue"}add(e){return new x("add",[this,M(e)],"add")}asBoolean(){if(this instanceof Sn)return this;if(this instanceof Sr)return new Ig(this);if(this instanceof br)return new Mv(this);if(this instanceof x)return new yg(this);throw new O("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new x("subtract",[this,M(e)],"subtract")}multiply(e){return new x("multiply",[this,M(e)],"multiply")}divide(e){return new x("divide",[this,M(e)],"divide")}mod(e){return new x("mod",[this,M(e)],"mod")}equal(e){return new x("equal",[this,M(e)],"equal").asBoolean()}notEqual(e){return new x("not_equal",[this,M(e)],"notEqual").asBoolean()}lessThan(e){return new x("less_than",[this,M(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new x("less_than_or_equal",[this,M(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new x("greater_than",[this,M(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new x("greater_than_or_equal",[this,M(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((s=>M(s)));return new x("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new x("array_contains",[this,M(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Hs(e.map(M),"arrayContainsAll"):e;return new x("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Hs(e.map(M),"arrayContainsAny"):e;return new x("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new x("array_reverse",[this])}arrayLength(){return new x("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Hs(e.map(M),"equalAny"):e;return new x("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Hs(e.map(M),"notEqualAny"):e;return new x("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new x("exists",[this],"exists").asBoolean()}charLength(){return new x("char_length",[this],"charLength")}like(e){return new x("like",[this,M(e)],"like").asBoolean()}regexContains(e){return new x("regex_contains",[this,M(e)],"regexContains").asBoolean()}regexFind(e){return new x("regex_find",[this,M(e)],"regexFind")}regexFindAll(e){return new x("regex_find_all",[this,M(e)],"regexFindAll")}regexMatch(e){return new x("regex_match",[this,M(e)],"regexMatch").asBoolean()}stringContains(e){return new x("string_contains",[this,M(e)],"stringContains").asBoolean()}startsWith(e){return new x("starts_with",[this,M(e)],"startsWith").asBoolean()}endsWith(e){return new x("ends_with",[this,M(e)],"endsWith").asBoolean()}toLower(){return new x("to_lower",[this],"toLower")}toUpper(){return new x("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(M(e)),new x("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(M(e)),new x("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(M(e)),new x("rtrim",t,"rtrim")}type(){return new x("type",[this])}isType(e){return new x("is_type",[this,Ei(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(M);return new x("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new x("string_index_of",[this,M(e)],"stringIndexOf")}stringRepeat(e){return new x("string_repeat",[this,M(e)],"stringRepeat")}stringReplaceAll(e,t){return new x("string_replace_all",[this,M(e),M(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new x("string_replace_one",[this,M(e),M(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(M);return new x("concat",[this,...r],"concat")}reverse(){return new x("reverse",[this],"reverse")}arrayFilter(e,t){return new x("array_filter",[this,M(e),t],"arrayFilter")}arrayTransform(e,t){return new x("array_transform",[this,M(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new x("array_transform",[this,M(e),M(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,M(e)];return t!==void 0&&r.push(M(t)),new x("array_slice",r,"arraySlice")}arrayFirst(){return new x("array_first",[this],"arrayFirst")}arrayFirstN(e){return new x("array_first_n",[this,M(e)],"arrayFirstN")}arrayLast(){return new x("array_last",[this],"arrayLast")}arrayLastN(e){return new x("array_last_n",[this,M(e)],"arrayLastN")}arrayMaximum(){return new x("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new x("maximum_n",[this,M(e)],"arrayMaximumN")}arrayMinimum(){return new x("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new x("minimum_n",[this,M(e)],"arrayMinimumN")}arrayIndexOf(e){return new x("array_index_of",[this,M(e),M("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new x("array_index_of",[this,M(e),M("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new x("array_index_of_all",[this,M(e)],"arrayIndexOfAll")}byteLength(){return new x("byte_length",[this],"byteLength")}ceil(){return new x("ceil",[this])}floor(){return new x("floor",[this])}abs(){return new x("abs",[this])}exp(){return new x("exp",[this])}mapGet(e){return new x("map_get",[this,Ei(e)],"mapGet")}mapSet(e,t,...r){const s=[this,M(e),M(t),...r.map(M)];return new x("map_set",s,"mapSet")}mapKeys(){return new x("map_keys",[this],"mapKeys")}mapValues(){return new x("map_values",[this],"mapValues")}mapEntries(){return new x("map_entries",[this],"mapEntries")}getField(e){return new x("get_field",[this,M(e)],"get_field")}count(){return nt._create("count",[this],"count")}sum(){return nt._create("sum",[this],"sum")}average(){return nt._create("average",[this],"average")}minimum(){return nt._create("minimum",[this],"minimum")}maximum(){return nt._create("maximum",[this],"maximum")}first(){return nt._create("first",[this],"first")}last(){return nt._create("last",[this],"last")}arrayAgg(){return nt._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return nt._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return nt._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new x("maximum",[this,...r.map(M)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new x("minimum",[this,...r.map(M)],"minimum")}vectorLength(){return new x("vector_length",[this],"vectorLength")}cosineDistance(e){return new x("cosine_distance",[this,Nu(e)],"cosineDistance")}dotProduct(e){return new x("dot_product",[this,Nu(e)],"dotProduct")}euclideanDistance(e){return new x("euclidean_distance",[this,Nu(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new x("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new x("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new x("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new x("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new x("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new x("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new x("timestamp_add",[this,M(e),M(t)],"timestampAdd")}timestampSubtract(e,t){return new x("timestamp_subtract",[this,M(e),M(t)],"timestampSubtract")}timestampDiff(e,t){return new x("timestamp_diff",[this,rl(e),M(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,M(e)];return t&&r.push(M(t)),new x("timestamp_extract",r,"timestampExtract")}documentId(){return new x("document_id",[this],"documentId")}parent(){return new x("parent",[this],"parent")}substring(e,t){const r=M(e);return new x("substring",t===void 0?[this,r]:[this,r,M(t)],"substring")}arrayGet(e){return new x("array_get",[this,M(e)],"arrayGet")}isError(){return new x("is_error",[this],"isError").asBoolean()}ifError(e){const t=new x("if_error",[this,M(e)],"ifError");return e instanceof Sn?t.asBoolean():t}isAbsent(){return new x("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new x("map_remove",[this,M(e)],"mapRemove")}mapMerge(e,...t){const r=M(e),s=t.map(M);return new x("map_merge",[this,r,...s],"mapMerge")}pow(e){return new x("pow",[this,M(e)])}trunc(e){return e===void 0?new x("trunc",[this]):new x("trunc",[this,M(e)],"trunc")}round(e){return e===void 0?new x("round",[this]):new x("round",[this,M(e)],"round")}collectionId(){return new x("collection_id",[this])}length(){return new x("length",[this])}ln(){return new x("ln",[this])}sqrt(){return new x("sqrt",[this])}stringReverse(){return new x("string_reverse",[this])}ifAbsent(e){return new x("if_absent",[this,M(e)],"ifAbsent")}ifNull(e){return new x("if_null",[this,M(e)],"ifNull")}coalesce(e,...t){return new x("coalesce",[this,M(e),...t.map(M)],"coalesce")}join(e){return new x("join",[this,M(e)],"join")}log10(){return new x("log10",[this])}arraySum(){return new x("sum",[this])}split(e){return new x("split",[this,M(e)])}timestampTruncate(e,t){const r=[this,M(e)];return t&&r.push(M(t)),new x("timestamp_trunc",r)}ascending(){return Bv(this)}descending(){return qv(this)}as(e){return new Ov(this,e,"as")}}class nt{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new nt(e,t);return s._methodName=r,s}as(e){return new Dv(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class Dv{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class Ov{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Hs extends Pr{constructor(e,t){super(),this.cr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.cr.map((t=>t._toProto(e)))}}}_readUserData(e){this.cr.forEach((t=>t._readUserData(e)))}}class br extends Pr{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new x("geo_distance",[this,M(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Bo(n){return Lv(n,"field")}function Lv(n,e){return new br(typeof n=="string"?Et===n?Zw()._internalPath:Ht("field",n):n._internalPath,e)}class Sr extends Pr{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Sr(e,void 0);return t._protoValue=e,t}_toProto(e){return L(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,Nv(this._protoValue)||(this._protoValue=bn(this.value,e))}}function Ei(n,e){return _g(n,"constant")}function _g(n,e){const t=new Sr(n,e);return typeof n=="boolean"?new Ig(t):t}class x extends Pr{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new qe({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class Sn extends Pr{get _methodName(){return this._expr._methodName}countIf(){return nt._create("count_if",[this],"countIf")}not(){return new x("not",[this],"not").asBoolean()}conditional(e,t){return new x("conditional",[this,e,t],"conditional")}ifError(e){const t=M(e),r=new x("if_error",[this,t],"ifError");return t instanceof Sn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class yg extends Sn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Ig extends Sn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Mv extends Sn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function Uv(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(Ei(r)),t.push(M(s))}return new x("map",t,"map")}function Fv(n){return(function(t,r){return new x("array",t.map((s=>M(s))),r)})(n,"array")}function Bv(n){return new sl(rl(n),"ascending","ascending")}function qv(n){return new sl(rl(n),"descending","descending")}class sl{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Xm(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Tg extends at{get _name(){return"add_fields"}get _optionsUtil(){return new qe({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[Ti(e,this.fields)]}}_readUserData(e){super._readUserData(e),Cn(this.fields,e)}}class Eg extends at{get _name(){return"aggregate"}get _optionsUtil(){return new qe({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[Ti(e,this.accumulators),Ti(e,this.groups)]}}_readUserData(e){super._readUserData(e),Cn(this.groups,e),Cn(this.accumulators,e)}}class wg extends at{get _name(){return"distinct"}get _optionsUtil(){return new qe({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[Ti(e,this.groups)]}}_readUserData(e){super._readUserData(e),Cn(this.groups,e)}}class zi extends at{get _name(){return"collection"}get _optionsUtil(){return new qe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.hr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.hr}]}}_readUserData(e){super._readUserData(e)}}class Gi extends at{get _name(){return"collection_group"}get _optionsUtil(){return new qe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Ba extends at{get _name(){return"database"}get _optionsUtil(){return new qe({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class qa extends at{get _name(){return"documents"}get _optionsUtil(){return new qe({})}constructor(e,t){if(super(t),!e||e.length===0)throw new O(C.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(r);if(s.size!==r.length)throw new O(C.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.Tr=r,this.Pr=s}_toProto(e){return{...super._toProto(e),args:this.Tr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class Hi extends at{get _name(){return"where"}get _optionsUtil(){return new qe({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),Cn(this.condition,e)}}class Vn extends at{get _name(){return"limit"}get _optionsUtil(){return new qe({})}constructor(e,t){L(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Ca(e,this.limit)]}}}class lf extends at{get _name(){return"offset"}get _optionsUtil(){return new qe({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Ca(e,this.offset)]}}}class $v extends at{get _name(){return"select"}get _optionsUtil(){return new qe({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[Ti(e,this.selections)]}}_readUserData(e){super._readUserData(e),Cn(this.selections,e)}}class vt extends at{get _name(){return"sort"}get _optionsUtil(){return new qe({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),Cn(this.orderings,e)}}class il extends at{get _name(){return"replace_with"}get _optionsUtil(){return new qe({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Xm(il.Ir)]}}_readUserData(e){super._readUserData(e),Cn(this.map,e)}}il.Ir="full_replace";function Cn(n,e){return gg(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ni{constructor(e,t,r,s){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=s}Vr(e,t){const r=this.userDataReader.createContext(3,e);return gg(t)?t._readUserData(r):Array.isArray(t)?t.forEach((s=>s._readUserData(r))):t.forEach((s=>s._readUserData(r))),t}where(e){const t=this.stages.map((r=>r));return this.Vr("where",e),t.push(new Hi(e,{})),new ni(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((r=>r));return t.push(new Vn(e,{})),new ni(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map((s=>s));return"orderings"in e?r.push(new vt(this.Vr("sort",e.orderings),{})):r.push(new vt(this.Vr("sort",[e,...t]),{})),new ni(this._db,this.userDataReader,this._userDataWriter,r)}dr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class Ue{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return Ki(this)}getPipelineCollectionGroup(){return ol(this)}getPipelineCollectionId(){return jv(this)}getPipelineDocuments(){return uc(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((s,i)=>{s._name!==wg.name&&s._name!==Eg.name||(r="keyless"),s._name===$v.name&&r==="exact"&&(r="augmented"),s._name===Tg.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return wn(this)}}function wn(n){const e=n.stages[0];return e instanceof zi||e instanceof Gi||e instanceof Ba||e instanceof qa?e._name:"unknown"}function Ki(n){if(wn(n)==="collection")return n.stages[0].hr}function ol(n){if(wn(n)==="collection_group")return n.stages[0].collectionId}function jv(n){switch(wn(n)){case"collection":return ee.fromString(Ki(n)).lastSegment();case"collection_group":return ol(n);default:return}}function uc(n){if(wn(n)==="documents")return n.stages[0].Tr}class E{constructor(e,t){this.type=e,this.value=t}static mr(){return new E("ERROR",void 0)}static pr(){return new E("UNSET",void 0)}static gr(){return new E("NULL",Vt)}static newValue(e){return st(e)?new E("NULL",Vt):(function(r){return!!r&&"booleanValue"in r})(e)?new E("BOOLEAN",e):wt(e)?new E("INT",e):Zn(e)?new E("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new E("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new E("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new E("BYTES",e):e.referenceValue?new E("REFERENCE",e):e.geoPointValue?new E("GEO_POINT",e):Pn(e)?new E("ARRAY",e):yr(e)?new E("VECTOR",e):rr(e)?new E("MAP",e):new E("ERROR",void 0)}yr(){return this.type==="ERROR"||this.type==="UNSET"}wr(){return this.type==="NULL"}}function ri(n){if(!n.yr())return n.value}function vg(n){return n instanceof Sn?n._expr:n}function G(n){if((n=vg(n))instanceof br)return new zv(n);if(n instanceof Sr)return new Gv(n);if(n instanceof Hs)return new Hv(n);if(n instanceof x){if(n.name==="add")return new Qv(n);if(n.name==="subtract")return new Yv(n);if(n.name==="multiply")return new Xv(n);if(n.name==="divide")return new Jv(n);if(n.name==="mod")return new Zv(n);if(n.name==="and")return new eA(n);if(n.name==="equal")return new dA(n);if(n.name==="not_equal")return new fA(n);if(n.name==="less_than")return new pA(n);if(n.name==="less_than_or_equal")return new mA(n);if(n.name==="greater_than")return new gA(n);if(n.name==="greater_than_or_equal")return new _A(n);if(n.name==="array_concat")return new yA(n);if(n.name==="array_reverse")return new IA(n);if(n.name==="array_contains")return new TA(n);if(n.name==="array_contains_all")return new EA(n);if(n.name==="array_contains_any")return new wA(n);if(n.name==="array_length")return new vA(n);if(n.name==="array_element")return new AA(n);if(n.name==="equal_any")return new Ag(n);if(n.name==="not_equal_any")return new nA(n);if(n.name==="is_nan")return new rA(n);if(n.name==="is_not_nan")return new sA(n);if(n.name==="is_null")return new iA(n);if(n.name==="is_not_null")return new oA(n);if(n.name==="is_error")return new aA(n);if(n.name==="exists")return new uA(n);if(n.name==="not")return new $a(n);if(n.name==="or")return new tA(n);if(n.name==="xor")return new al(n);if(n.name==="conditional")return new cA(n);if(n.name==="maximum")return new lA(n);if(n.name==="minimum")return new hA(n);if(n.name==="reverse")return new RA(n);if(n.name==="replace_first")return new PA(n);if(n.name==="replace_all")return new bA(n);if(n.name==="char_length")return new SA(n);if(n.name==="byte_length")return new VA(n);if(n.name==="like")return new CA(n);if(n.name==="regex_contains")return new xA(n);if(n.name==="regex_match")return new NA(n);if(n.name==="string_contains")return new kA(n);if(n.name==="starts_with")return new DA(n);if(n.name==="ends_with")return new OA(n);if(n.name==="to_lower")return new LA(n);if(n.name==="to_upper")return new MA(n);if(n.name==="trim")return new UA(n);if(n.name==="string_concat")return new FA(n);if(n.name==="map_get")return new BA(n);if(n.name==="cosine_distance")return new qA(n);if(n.name==="dot_product")return new $A(n);if(n.name==="euclidean_distance")return new jA(n);if(n.name==="vector_length")return new zA(n);if(n.name==="unix_micros_to_timestamp")return new QA(n);if(n.name==="timestamp_to_unix_micros")return new JA(n);if(n.name==="unix_millis_to_timestamp")return new YA(n);if(n.name==="timestamp_to_unix_millis")return new ZA(n);if(n.name==="unix_seconds_to_timestamp")return new XA(n);if(n.name==="timestamp_to_unix_seconds")return new eR(n);if(n.name==="timestamp_add")return new tR(n);if(n.name==="timestamp_subtract")return new nR(n)}throw new Error(`Unknown Expr : ${n}`)}class zv{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Et)return E.newValue({referenceValue:Ii(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return E.newValue({timestampValue:Fo(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return E.newValue({timestampValue:Fo(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?ba(r)?E.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:Fo(i.serializer,z.fromTimestamp(Jr(o)))};if(i.serverTimestampBehavior==="previous"){const u=Ui(o);if(u)return u}return{nullValue:"NULL_VALUE"}})(e,r)):E.newValue(r):E.pr()}}class Gv{constructor(e){this.expr=e}evaluate(e,t){return E.newValue(this.expr._getValue())}}class Hv{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.cr.map((s=>G(s).evaluate(e,t)));return r.some((s=>s.yr()))?E.mr():E.newValue({arrayValue:{values:r.map((s=>s.value))}})}}function De(n){return Zn(n)?Number(n.doubleValue):Number(n.integerValue)}function Nt(n){return BigInt(n.integerValue)}const Kv=BigInt("0x7fffffffffffffff"),Wv=-BigInt("0x8000000000000000");class Wi{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length>=2,24778);const r=G(this.expr.params[0]).evaluate(e,t),s=G(this.expr.params[1]).evaluate(e,t);let i=this.br(r,s);for(const o of this.expr.params.slice(2)){const u=G(o).evaluate(e,t);i=this.br(i,u)}return i}br(e,t){if(e.yr()||t.yr())return E.mr();if(e.wr()||t.wr())return E.gr();const r=e.value,s=t.value;if(!Zn(r)&&!wt(r)||!Zn(s)&&!wt(s))return E.mr();if(Zn(r)||Zn(s)){const i=this.Sr(r,s);return i?E.newValue(i):E.mr()}if(wt(r)&&wt(s)){const i=this.vr(r,s);return i===void 0?E.mr():typeof i=="number"?E.newValue({doubleValue:i}):i<Wv||i>Kv?E.mr():E.newValue({integerValue:`${i}`})}return E.mr()}}function Kt(n,e){return Ee(n)!==Ee(e)?"TYPE_MISMATCH":et(n)||et(e)?"NOT_EQ":st(n)&&st(e)?"EQ":st(n)||st(e)?"NULL":Pn(n)&&Pn(e)?(function(r,s){var o,u,c;if(((o=r.values)==null?void 0:o.length)!==((u=s.values)==null?void 0:u.length))return"NOT_EQ";let i=!1;for(let l=0;l<(((c=r.values)==null?void 0:c.length)??0);l++){const f=r.values[l],p=s.values[l];switch(Kt(f,p)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:B(44609,{Dr:f,Cr:p})}}return i?"NULL":"EQ"})(n.arrayValue,e.arrayValue):yr(n)&&yr(e)||rr(n)&&rr(e)?(function(r,s){const i=r.fields||{},o=s.fields||{};if(Zo(i)!==Zo(o))return"NOT_EQ";let u=!1;for(const c in i)if(i.hasOwnProperty(c)){if(o[c]===void 0)return"NOT_EQ";switch(Kt(i[c],o[c])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":u=!0}}return u?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,s){return pt(r,s,{u:!1,i:!0,o:!0})})(n,e)?"EQ":"NOT_EQ"}class Qv extends Wi{vr(e,t){return Nt(e)+Nt(t)}Sr(e,t){return{doubleValue:De(e)+De(t)}}}class Yv extends Wi{constructor(e){super(e),this.expr=e}vr(e,t){return Nt(e)-Nt(t)}Sr(e,t){return{doubleValue:De(e)-De(t)}}}class Xv extends Wi{constructor(e){super(e),this.expr=e}vr(e,t){return Nt(e)*Nt(t)}Sr(e,t){return{doubleValue:De(e)*De(t)}}}class Jv extends Wi{constructor(e){super(e),this.expr=e}vr(e,t){const r=Nt(t);if(r!==BigInt(0))return Nt(e)/r}Sr(e,t){const r=De(t);return r===0?{doubleValue:Zr(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:De(e)/r}}}class Zv extends Wi{constructor(e){super(e),this.expr=e}vr(e,t){const r=Nt(t);if(r!==BigInt(0))return Nt(e)%r}Sr(e,t){const r=De(t);if(r!==0)return{doubleValue:De(e)%r}}}class eA{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const o of this.expr.params){const u=G(o).evaluate(e,t);switch(u.type){case"BOOLEAN":if(!((i=u.value)!=null&&i.booleanValue))return E.newValue(Ve);break;case"NULL":s=!0;break;default:r=!0}}return r?E.mr():s?E.gr():E.newValue(Ze)}}class $a{constructor(e){this.expr=e}evaluate(e,t){var s;L(this.expr.params.length===1,9634);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return E.newValue({booleanValue:!((s=r.value)!=null&&s.booleanValue)});case"NULL":return E.gr();default:return E.mr()}}}class tA{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const o of this.expr.params){const u=G(o).evaluate(e,t);switch(u.type){case"BOOLEAN":if((i=u.value)!=null&&i.booleanValue)return E.newValue(Ze);break;case"NULL":s=!0;break;default:r=!0}}return r?E.mr():s?E.gr():E.newValue(Ve)}}class al{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const o of this.expr.params){const u=G(o).evaluate(e,t);switch(u.type){case"BOOLEAN":r=al.xor(r,!!((i=u.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return E.mr()}}return s?E.gr():E.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class Ag{constructor(e){this.expr=e}evaluate(e,t){var o,u;L(this.expr.params.length===2,55094);let r=!1;const s=G(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return E.mr()}const i=G(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.mr()}if(r)return E.gr();for(const c of((u=(o=i.value)==null?void 0:o.arrayValue)==null?void 0:u.values)??[])switch(st(s.value)&&st(c)?"EQ":Kt(s.value,c)){case"EQ":return E.newValue(Ze);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44608,{value:s.value,candidate:c})}return r?E.gr():E.newValue(Ve)}}class nA{constructor(e){this.expr=e}evaluate(e,t){return new $a(new x("not",[new x("equal_any",this.expr.params)])).evaluate(e,t)}}class rA{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,23322);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return E.newValue(Ve);case"DOUBLE":return E.newValue({booleanValue:isNaN(De(r.value))});case"NULL":return E.gr();default:return E.mr()}}}class sA{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===1,50406),new $a(new x("not",[new x("is_nan",this.expr.params)])).evaluate(e,t)}}class iA{constructor(e){this.expr=e}evaluate(e,t){switch(L(this.expr.params.length===1,23123),G(this.expr.params[0]).evaluate(e,t).type){case"NULL":return E.newValue(Ze);case"UNSET":case"ERROR":return E.mr();default:return E.newValue(Ve)}}}class oA{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===1,23167),new $a(new x("not",[new x("is_null",this.expr.params)])).evaluate(e,t)}}class aA{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===1,5228),G(this.expr.params[0]).evaluate(e,t).type==="ERROR"?E.newValue(Ze):E.newValue(Ve)}}class uA{constructor(e){this.expr=e}evaluate(e,t){switch(L(this.expr.params.length===1,6877),G(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return E.mr();case"UNSET":return E.newValue(Ve);default:return E.newValue(Ze)}}}class cA{constructor(e){this.expr=e}evaluate(e,t){var s;L(this.expr.params.length===3,11706);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(s=r.value)!=null&&s.booleanValue?G(this.expr.params[1]).evaluate(e,t):G(this.expr.params[2]).evaluate(e,t);case"NULL":return G(this.expr.params[2]).evaluate(e,t);default:return E.mr()}}}class lA{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>G(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Be(i.value,s.value)>0?i:s}return s===void 0?E.gr():s}}class hA{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>G(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Be(i.value,s.value)<0?i:s}return s===void 0?E.gr():s}}class ms{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return E.mr()}const s=G(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return E.mr()}return this.Fr(r,s)}}class dA extends ms{constructor(e){super(e),this.expr=e}Fr(e,t){if(e.wr()&&t.wr())return E.newValue(Ze);if(e.wr()||t.wr()||et(e.value)||et(t.value)||Ee(e.value)!==Ee(t.value))return E.newValue(Ve);switch(Kt(e.value,t.value)){case"EQ":return E.newValue(Ze);case"NOT_EQ":return E.newValue(Ve);case"NULL":return E.gr();default:B(44615,{left:e,right:t})}}}class fA extends ms{constructor(e){super(e),this.expr=e}Fr(e,t){switch(Kt(e.value,t.value)){case"EQ":return E.newValue(Ve);case"NOT_EQ":case"TYPE_MISMATCH":return E.newValue(Ze);case"NULL":return E.gr();default:B(44614,{left:e,right:t})}}}class pA extends ms{constructor(e){super(e),this.expr=e}Fr(e,t){return Ee(e.value)!==Ee(t.value)||et(e.value)||et(t.value)?E.newValue(Ve):E.newValue({booleanValue:Be(e.value,t.value)<0})}}class mA extends ms{constructor(e){super(e),this.expr=e}Fr(e,t){return Ee(e.value)!==Ee(t.value)||et(e.value)||et(t.value)?E.newValue(Ve):Kt(e.value,t.value)==="EQ"?E.newValue(Ze):E.newValue({booleanValue:Be(e.value,t.value)<0})}}class gA extends ms{constructor(e){super(e),this.expr=e}Fr(e,t){return Ee(e.value)!==Ee(t.value)||et(e.value)||et(t.value)?E.newValue(Ve):E.newValue({booleanValue:Be(e.value,t.value)>0})}}class _A extends ms{constructor(e){super(e),this.expr=e}Fr(e,t){return Ee(e.value)!==Ee(t.value)||et(e.value)||et(t.value)?E.newValue(Ve):Kt(e.value,t.value)==="EQ"?E.newValue(Ze):E.newValue({booleanValue:Be(e.value,t.value)>0})}}class yA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class IA{constructor(e){this.expr=e}evaluate(e,t){var s;L(this.expr.params.length===1,216);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.gr();case"ARRAY":{const i=((s=r.value.arrayValue)==null?void 0:s.values)??[];return E.newValue({arrayValue:{values:[...i].reverse()}})}default:return E.mr()}}}class TA{constructor(e){this.expr=e}evaluate(e,t){return L(this.expr.params.length===2,52884),new Ag(new x("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class EA{constructor(e){this.expr=e}evaluate(e,t){var c,l,f,p;L(this.expr.params.length===2,1392);let r=!1;const s=G(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.mr()}const i=G(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.mr()}if(r)return E.gr();const o=((l=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:l.values)??[],u=((p=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:p.values)??[];for(const g of o){let A=!1;r=!1;for(const S of u){switch(st(g)&&st(S)?"EQ":Kt(g,S)){case"EQ":A=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44613,{value:S,search:g})}if(A)break}if(!A)return E.newValue(Ve)}return E.newValue(Ze)}}class wA{constructor(e){this.expr=e}evaluate(e,t){var c,l,f,p;L(this.expr.params.length===2,2680);let r=!1;const s=G(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.mr()}const i=G(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return E.mr()}if(r)return E.gr();const o=((l=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:l.values)??[],u=((p=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:p.values)??[];for(const g of u)for(const A of o)switch(st(g)&&st(A)?"EQ":Kt(g,A)){case"EQ":return E.newValue(Ze);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(60403,{value:g,search:A})}return r?E.gr():E.newValue(Ve)}}class vA{constructor(e){this.expr=e}evaluate(e,t){var s,i,o;L(this.expr.params.length===1,38605);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.gr();case"ARRAY":return E.newValue({integerValue:`${((o=(i=(s=r.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:o.length)??0}`});default:return E.mr()}}}class AA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class RA{constructor(e){this.expr=e}evaluate(e,t){var s,i;L(this.expr.params.length===1,1508);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.gr();case"BYTES":{const o=(s=r.value)==null?void 0:s.bytesValue;if(typeof o=="string"){const u=fe.fromBase64String(o).toUint8Array();return u.reverse(),E.newValue({bytesValue:fe.fromUint8Array(u).toBase64()})}return E.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(i=r.value)==null?void 0:i.stringValue,u=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),c=Array.from(u,(l=>l.segment)).reverse();return E.newValue({stringValue:c.join("")})}default:return E.mr()}}}class PA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class bA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class SA{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,19400);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return E.gr();case"STRING":{const s=(function(o){let u=0;for(let c=0;c<o.length;c++){const l=o.codePointAt(c);if(l===void 0)return;if(l<=65535)if(l>=55296&&l<=57343)if(l<=56319){const f=o.codePointAt(c+1);f!==void 0&&f>=56320&&f<=57343?(u+=1,c++):u+=1}else u+=1;else u+=1;else{if(!(l<=1114111))return;u+=1,c++}}return u})(r.value.stringValue);return s===void 0?E.mr():E.newValue({integerValue:s})}default:return E.mr()}}}class VA{constructor(e){this.expr=e}evaluate(e,t){var s,i;L(this.expr.params.length===1,8486);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const o=(s=r.value)==null?void 0:s.bytesValue;return typeof o=="string"?E.newValue({integerValue:fe.fromBase64String(o).toUint8Array().length}):E.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(c){let l=0;for(let f=0;f<c.length;f++){const p=c.codePointAt(f);if(p===void 0)return;if(p>=55296&&p<=57343){if(!(p<=56319))return;{const g=c.codePointAt(f+1);if(g===void 0||!(g>=56320&&g<=57343))return;l+=4,f++}}else if(p<=127)l+=1;else if(p<=2047)l+=2;else if(p<=65535)l+=3;else{if(!(p<=1114111))return;l+=4,f++}}return l})((i=r.value)==null?void 0:i.stringValue);return o===void 0?E.mr():E.newValue({integerValue:o})}case"NULL":return E.gr();default:return E.mr()}}}class gs{constructor(e){this.expr=e}evaluate(e,t){var o,u;L(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=G(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return E.mr()}const i=G(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return E.mr()}return r?E.gr():this.Or((o=s.value)==null?void 0:o.stringValue,(u=i.value)==null?void 0:u.stringValue)}}class CA extends gs{Or(e,t){try{const r=(function(o){let u="";for(let c=0;c<o.length;c++){const l=o.charAt(c);switch(l){case"_":u+=".";break;case"%":u+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":u+="\\"+l;break;default:u+=l}}return"^"+u+"$"})(t),s=vc.compile(r);return E.newValue({booleanValue:s.matches(e)})}catch(r){return ft(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),E.mr()}}}class xA extends gs{Or(e,t){try{const r=vc.compile(t);return E.newValue({booleanValue:r.test(e)})}catch{return ft(`Invalid regex pattern found in regex_contains: ${t}, returning error`),E.mr()}}}class NA extends gs{Or(e,t){try{return E.newValue({booleanValue:vc.compile(t).matches(e)})}catch{return ft(`Invalid regex pattern found in regex_match: ${t}, returning error`),E.mr()}}}class kA extends gs{Or(e,t){return E.newValue({booleanValue:e.includes(t)})}}class DA extends gs{Or(e,t){return E.newValue({booleanValue:e.startsWith(t)})}}class OA extends gs{Or(e,t){return E.newValue({booleanValue:e.endsWith(t)})}}class LA{constructor(e){this.expr=e}evaluate(e,t){var s,i;L(this.expr.params.length===1,29079);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return E.gr();default:return E.mr()}}}class MA{constructor(e){this.expr=e}evaluate(e,t){var s,i;L(this.expr.params.length===1,60487);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return E.gr();default:return E.mr()}}}class UA{constructor(e){this.expr=e}evaluate(e,t){var s,i;L(this.expr.params.length===1,28544);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return E.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return E.gr();default:return E.mr()}}}class FA{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((o=>G(o).evaluate(e,t)));let s="",i=!1;for(const o of r)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return E.mr()}return i?E.gr():E.newValue({stringValue:s})}}class BA{constructor(e){this.expr=e}evaluate(e,t){var o,u,c,l;L(this.expr.params.length===2,4483);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return E.pr();case"MAP":break;default:return E.mr()}const s=G(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return E.mr();const i=(l=(u=(o=r.value)==null?void 0:o.mapValue)==null?void 0:u.fields)==null?void 0:l[(c=s.value)==null?void 0:c.stringValue];return i===void 0?E.pr():E.newValue(i)}}class ul{constructor(e){this.expr=e}evaluate(e,t){var l,f;L(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=G(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return E.mr()}const i=G(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return E.mr()}if(r)return E.gr();const o=Xu(s.value),u=Xu(i.value);if(o===void 0||u===void 0||((l=o.values)==null?void 0:l.length)!==((f=u.values)==null?void 0:f.length))return E.mr();const c=this.Mr(o,u);return c===void 0||isNaN(c)?E.mr():E.newValue({doubleValue:c})}}class qA extends ul{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return;let i=0,o=0,u=0;for(let l=0;l<r.length;l++){if(!Rn(r[l])||!Rn(s[l]))return;const f=De(r[l]),p=De(s[l]);i+=f*p,o+=f*f,u+=p*p}const c=Math.sqrt(o)*Math.sqrt(u);if(c!==0)return 1-Math.max(-1,Math.min(1,i/c))}}class $A extends ul{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!Rn(r[o])||!Rn(s[o]))return;i+=De(r[o])*De(s[o])}return i}}class jA extends ul{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!Rn(r[o])||!Rn(s[o]))return;const u=De(r[o]),c=De(s[o]);i+=Math.pow(u-c,2)}return Math.sqrt(i)}}class zA{constructor(e){this.expr=e}evaluate(e,t){var s;L(this.expr.params.length===1,39044);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const i=Xu(r.value);return E.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return E.gr();default:return E.mr()}}}const wi=BigInt(-62135596800),vi=BigInt(253402300799),ua=BigInt(1e3),vn=BigInt(1e6),GA=wi*ua,HA=vi*ua+BigInt(999),KA=wi*vn,WA=vi*vn+BigInt(999999);function cl(n){return n>=KA&&n<=WA}function Rg(n){return n>=wi&&n<=vi}function Ai(n,e){const t=BigInt(n);return!(t<wi||t>vi)&&!(e<0||e>=1e9)&&(t!==wi||e===0)&&!(t===vi&&e>999999999)}function Pg(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function ll(n){return BigInt(n.seconds)*vn+BigInt(Math.trunc(n.nanoseconds/1e3))}class hl{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return E.gr();default:return E.mr()}}}class QA extends hl{toTimestamp(e){if(!cl(e))return E.mr();let t=Number(e/vn),r=Number(e%vn*BigInt(1e3));const s=Pg(t,r);return t=s.seconds,r=s.nanos,Ai(t,r)?E.newValue({timestampValue:{seconds:t,nanos:r}}):E.mr()}}class YA extends hl{toTimestamp(e){if(!(function(o){return o>=GA&&o<=HA})(e))return E.mr();let t=Number(e/ua),r=Number(e%ua*BigInt(1e6));const s=Pg(t,r);return t=s.seconds,r=s.nanos,Ai(t,r)?E.newValue({timestampValue:{seconds:t,nanos:r}}):E.mr()}}class XA extends hl{toTimestamp(e){if(!Rg(e))return E.mr();const t=Number(e);return E.newValue({timestampValue:{seconds:t,nanos:0}})}}class dl{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=G(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return E.gr();default:return E.mr()}const s=Qc(r.value.timestampValue);return Ai(s.seconds,s.nanoseconds)?this.Nr(s):E.mr()}}class JA extends dl{Nr(e){const t=ll(e);return cl(t)?E.newValue({integerValue:`${t.toString()}`}):E.mr()}}class ZA extends dl{Nr(e){const t=ll(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?E.newValue({integerValue:r.toString()}):E.newValue({integerValue:(r-BigInt(1)).toString()})}}class eR extends dl{Nr(e){const t=BigInt(e.seconds);return Rg(t)?E.newValue({integerValue:t.toString()}):E.mr()}}class bg{constructor(e){this.expr=e}evaluate(e,t){L(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=G(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return E.mr()}const i=G(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(j){switch(j){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return E.mr();break;case"NULL":r=!0;break;default:return E.mr()}const u=G(this.expr.params[2]).evaluate(e,t);switch(u.type){case"INT":break;case"NULL":r=!0;break;default:return E.mr()}if(r)return E.gr();const c=BigInt(u.value.integerValue);let l;try{switch(o){case"microsecond":l=c;break;case"millisecond":l=c*BigInt(1e3);break;case"second":l=c*BigInt(1e6);break;case"minute":l=c*BigInt(6e7);break;case"hour":l=c*BigInt(36e8);break;case"day":l=c*BigInt(864e8);break;default:return E.mr()}if(o!=="microsecond"&&c!==BigInt(0)&&l/c!==BigInt(this.Lr(o)))return E.mr()}catch($){return ft(`Error during timestamp arithmetic: ${$}`),E.mr()}const f=Qc(s.value.timestampValue);if(!Ai(f.seconds,f.nanoseconds))return E.mr();const p=ll(f),g=this.Br(p,l);if(!cl(g))return E.mr();const A=Number(g/vn),S=g%vn,D=Number((S<0?S+vn:S)*BigInt(1e3)),N=S<0?A-1:A;return Ai(N,D)?E.newValue({timestampValue:{seconds:N,nanos:D}}):E.mr()}Lr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class tR extends bg{Br(e,t){return e+t}}class nR extends bg{Br(e,t){return e-t}}function Ri(n){if((n=vg(n))instanceof br)return`fld(${n.fieldName})`;if(n instanceof Sr)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof _e?`ref(${t.path})`:t instanceof Je?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof x)return`fn(${n.name},[${n.params.map(Ri).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.cr.map(Ri).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function rR(n){if(n instanceof Tg)return`${n._name}(${wo(n.fields)})`;if(n instanceof Eg){let e=`${n._name}(${wo(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${wo(n.groups)})`),e}if(n instanceof wg)return`${n._name}(${wo(n.groups)})`;if(n instanceof zi)return`${n._name}(${n.hr})`;if(n instanceof Gi)return`${n._name}(${n.collectionId})`;if(n instanceof Ba)return`${n._name}()`;if(n instanceof qa)return`${n._name}(${n.Tr.sort()})`;if(n instanceof Hi)return`${n._name}(${Ri(n.condition)})`;if(n instanceof Vn)return`${n._name}(${n.limit})`;if(n instanceof vt)return`${n._name}(${(function(t){return t.map((r=>`${Ri(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function wo(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${Ri(t)}`)).join(",")}`}function Bt(n){return n.stages.map((e=>rR(e))).join("|")}function Sg(n,e){return Bt(n)===Bt(e)}function Ie(n){return n instanceof Ue}function hf(n){return Ie(n)?Bt(n):Zs(n)}function Vg(n){return Ie(n)?Bt(n):(function(t){return`${ra(ht(t))}|lt:${t.limitType}`})(n)}function ja(n,e){return n instanceof Ue&&e instanceof Ue?Sg(n,e):!(n instanceof Ue&&!(e instanceof Ue)||!(n instanceof Ue)&&e instanceof Ue)&&Vw(n,e)}function za(n){return mn(n)?Bt(n):ra(n)}function fl(n,e){return n instanceof Ue&&e instanceof Ue?Sg(n,e):!(n instanceof Ue&&!(e instanceof Ue)||!(n instanceof Ue)&&e instanceof Ue)&&Gc(n,e)}function sR(n,e){const t=(function(s){let i=!1;const o=[];for(const u of s)if(u instanceof vt)if(i=!0,u.orderings.some((c=>c.expr instanceof br&&c.expr.fieldName===Et)))o.push(u);else{const c=u.orderings.map((l=>l));c.push(Bo(Et).ascending()),o.push(new vt(c,{}))}else u instanceof Vn&&(i||(o.push(new vt([Bo(Et).ascending()],{})),i=!0)),o.push(u);return i||o.push(new vt([Bo(Et).ascending()],{})),o})(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(r)))}return new Ue(n.userDataReader.serializer,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pl{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&pw(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Xs(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Xs(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Om();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let u=this.applyToLocalView(o,i.mutatedFields);u=t.has(s.key)?null:u;const c=Tm(o,u);c!==null&&r.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(z.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),Y())}isEqual(e){return this.batchId===e.batchId&&Xr(this.mutations,e.mutations,((t,r)=>Fd(t,r)))&&Xr(this.baseMutations,e.baseMutations,((t,r)=>Fd(t,r)))}}class ml{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){L(e.mutations.length===r.length,58842,{Ur:e.mutations.length,kr:r.length});let s=(function(){return Dw})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new ml(e,t,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ca="";function Fe(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=df(e)),e=iR(n.get(t),e);return df(e)}function iR(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case ca:t+="";break;default:t+=i}}return t}function df(n){return n+ca+""}function At(n){const e=n.length;if(L(e>=2,64408,{path:n}),e===2)return L(n.charAt(0)===ca&&n.charAt(1)==="",56145,{path:n}),ee.emptyPath();const t=e-2,r=[];let s="";for(let i=0;i<e;){const o=n.indexOf(ca,i);switch((o<0||o>t)&&B(50515,{path:n}),n.charAt(o+1)){case"":const u=n.substring(i,o);let c;s.length===0?c=u:(s+=u,c=s,s=""),r.push(c);break;case"":s+=n.substring(i,o),s+="\0";break;case"":s+=n.substring(i,o+1);break;default:B(61167,{path:n})}i=o+2}return new ee(r)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hn="remoteDocuments",Qi="owner",Or="owner",Pi="mutationQueues",oR="userId",mt="mutations",ff="batchId",er="userMutationsIndex",pf=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qo(n,e){return[n,Fe(e)]}function Cg(n,e,t){return[n,Fe(e),t]}const aR={},os="documentMutations",la="remoteDocumentsV14",uR=["prefixPath","collectionGroup","readTime","documentId"],$o="documentKeyIndex",cR=["prefixPath","collectionGroup","documentId"],xg="collectionGroupIndex",lR=["collectionGroup","readTime","prefixPath","documentId"],bi="remoteDocumentGlobal",cc="remoteDocumentGlobalKey",as="targets",Ng="queryTargetsIndex",hR=["canonicalId","targetId"],us="targetDocuments",dR=["targetId","path"],gl="documentTargetsIndex",fR=["path","targetId"],ha="targetGlobalKey",or="targetGlobal",Si="collectionParents",pR=["collectionId","parent"],cs="clientMetadata",mR="clientId",Ga="bundles",gR="bundleId",Ha="namedQueries",_R="name",_l="indexConfiguration",yR="indexId",lc="collectionGroupIndex",IR="collectionGroup",si="indexState",TR=["indexId","uid"],kg="sequenceNumberIndex",ER=["uid","sequenceNumber"],ii="indexEntries",wR=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Dg="documentKeyIndex",vR=["indexId","uid","orderedDocumentKey"],Ka="documentOverlays",AR=["userId","collectionPath","documentId"],hc="collectionPathOverlayIndex",RR=["userId","collectionPath","largestBatchId"],Og="collectionGroupOverlayIndex",PR=["userId","collectionGroup","largestBatchId"],yl="globals",bR="name",Lg=[Pi,mt,os,Hn,as,Qi,or,us,cs,bi,Si,Ga,Ha],SR=[...Lg,Ka],Mg=[Pi,mt,os,la,as,Qi,or,us,cs,bi,Si,Ga,Ha,Ka],Ug=Mg,Il=[...Ug,_l,si,ii],VR=Il,Fg=[...Il,yl],CR=Fg;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bg(n,e,t){const r=n.store(mt),s=n.store(os),i=[],o=IDBKeyRange.only(t.batchId);let u=0;const c=r.Hn({range:o},((f,p,g)=>(u++,g.delete())));i.push(c.next((()=>{L(u===1,47070,{batchId:t.batchId})})));const l=[];for(const f of t.mutations){const p=Cg(e,f.key.path,t.batchId);i.push(s.delete(p)),l.push(f.key)}return R.waitFor(i).next((()=>l))}function da(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw B(14731);e=n.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dc extends sg{constructor(e,t){super(),this.qr=e,this.currentSequenceNumber=t}}function Pe(n,e){const t=W(n);return Tn.Cn(t.qr,e)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tl{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e,t,r,s,i=z.min(),o=z.min(),u=fe.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=u,this.expectedCount=c}withSequenceNumber(e){return new Rt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Rt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Rt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Rt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qg{constructor(e){this.$r=e}}function xR(n,e){let t;if(e.document)t=Gw(n.$r,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=F.fromSegments(e.noDocument.path),s=Er(e.noDocument.readTime);t=ge.newNoDocument(r,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return B(56709);{const r=F.fromSegments(e.unknownDocument.path),s=Er(e.unknownDocument.version);t=ge.newUnknownDocument(r,s)}}return e.readTime&&t.setReadTime((function(s){const i=new se(s[0],s[1]);return z.fromTimestamp(i)})(e.readTime)),t}function mf(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:fa(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=(function(i,o){return{name:Ii(i,o.key),fields:o.data.value.mapValue.fields,updateTime:sr(i,o.version.toTimestamp()),createTime:sr(i,o.createTime.toTimestamp())}})(n.$r,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:Tr(e.version)};else{if(!e.isUnknownDocument())return B(57904,{document:e});r.unknownDocument={path:t.path.toArray(),version:Tr(e.version)}}return r}function fa(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function Tr(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Er(n){const e=new se(n.seconds,n.nanoseconds);return z.fromTimestamp(e)}function Wn(n,e){const t=(e.baseMutations||[]).map((i=>oc(n.$r,i)));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const u=e.mutations[i+1];o.updateTransforms=u.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const r=e.mutations.map((i=>oc(n.$r,i))),s=se.fromMillis(e.localWriteTimeMs);return new pl(e.batchId,s,t,r)}function Ks(n,e){const t=Er(e.readTime),r=e.lastLimboFreeSnapshotVersion!==void 0?Er(e.lastLimboFreeSnapshotVersion):z.min();let s;return s=(function(o){return o.structuredPipeline!==void 0})(e.query)?(function(o,u){var f,p;const c=o.structuredPipeline;L((((f=c==null?void 0:c.pipeline)==null?void 0:f.stages)??[]).length>0,1845);const l=(p=c==null?void 0:c.pipeline)==null?void 0:p.stages.map(NR);return new Ue(u,l)})(e.query,n.$r):(function(o){return o.documents!==void 0})(e.query)?(function(o){const u=o.documents.length;return L(u===1,1966,{count:u}),ht(Bi(qm(o.documents[0])))})(e.query):(function(o){return ht(Gm(o))})(e.query),new Rt(s,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,r,fe.fromBase64String(e.resumeToken))}function $g(n,e){const t=Tr(e.snapshotVersion),r=Tr(e.lastLimboFreeSnapshotVersion);let s;s=mn(e.target)?Hm(n.$r,e.target):Hc(e.target)?jm(n.$r,e.target):zm(n.$r,e.target).Se;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:za(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:s}}function jg(n){const e=Gm({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ia(e,e.limit,"L"):e}function vo(n,e){return new Tl(e.largestBatchId,oc(n.$r,e.overlayMutation))}function gf(n,e){const t=e.path.lastSegment();return[n,Fe(e.path.popLast()),t]}function _f(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:Tr(r.readTime),documentKey:Fe(r.documentKey.path),largestBatchId:r.largestBatchId}}function NR(n){switch(n.name){case"collection":return new zi(n.args[0].referenceValue,{});case"collection_group":return new Gi(n.args[1].stringValue,{});case"database":return new Ba({});case"documents":return new qa(n.args.map((e=>e.referenceValue)),{});case"where":return new Hi(fc(n.args[0]),{});case"limit":{const e=n.args[0].integerValue??n.args[0].doubleValue;return new Vn(typeof e=="number"?e:Number(e),{})}case"sort":return new vt(n.args.map((e=>(function(r){var i,o;const s=(i=r.mapValue)==null?void 0:i.fields;return new sl(fc(s.expression),(o=s.direction)==null?void 0:o.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${n.name} not supported.`)}}function fc(n){return n.fieldReferenceValue?new br(Ht("_exprFromProto",n.fieldReferenceValue),"_exprFromProto"):n.functionValue?(function(t){var r;return new x(t.functionValue.name,((r=t.functionValue.args)==null?void 0:r.map(fc))||[])})(n):Sr._fromProto(n)}class Wa{constructor(e,t,r,s){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=s,this.Kr={}}static Qr(e,t,r,s){L(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new Wa(i,t,r,s)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return on(e).Hn({index:er,range:r},((s,i,o)=>{t=!1,o.done()})).next((()=>t))}addMutationBatch(e,t,r,s){const i=Kr(e),o=on(e);return o.add({}).next((u=>{L(typeof u=="number",49019);const c=new pl(u,t,r,s),l=(function(A,S,D){const N=D.baseMutations.map((j=>oa(A.$r,j))),$=D.mutations.map((j=>oa(A.$r,j)));return{userId:S,batchId:D.batchId,localWriteTimeMs:D.localWriteTime.toMillis(),baseMutations:N,mutations:$}})(this.serializer,this.userId,c),f=[];let p=new ie(((g,A)=>K(g.canonicalString(),A.canonicalString())));for(const g of s){const A=Cg(this.userId,g.key.path,u);p=p.add(g.key.path.popLast()),f.push(o.put(l)),f.push(i.put(A,aR))}return p.forEach((g=>{f.push(this.indexManager.addToCollectionParentIndex(e,g))})),e.addOnCommittedListener((()=>{this.Kr[u]=c.keys()})),R.waitFor(f).next((()=>c))}))}lookupMutationBatch(e,t){return on(e).get(t).next((r=>r?(L(r.userId===this.userId,48,"Unexpected user for mutation batch",{userId:r.userId,batchId:t}),Wn(this.serializer,r)):null))}Wr(e,t){return this.Kr[t]?R.resolve(this.Kr[t]):this.lookupMutationBatch(e,t).next((r=>{if(r){const s=r.keys();return this.Kr[t]=s,s}return null}))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=IDBKeyRange.lowerBound([this.userId,r]);let i=null;return on(e).Hn({index:er,range:s},((o,u,c)=>{u.userId===this.userId&&(L(u.batchId>=r,47524,{Gr:r}),i=Wn(this.serializer,u)),c.done()})).next((()=>i))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=nr;return on(e).Hn({index:er,range:t,reverse:!0},((s,i,o)=>{r=i.batchId,o.done()})).next((()=>r))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,nr],[this.userId,Number.POSITIVE_INFINITY]);return on(e).Qn(er,t).next((r=>r.map((s=>Wn(this.serializer,s)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=qo(this.userId,t.path),s=IDBKeyRange.lowerBound(r),i=[];return Kr(e).Hn({range:s},((o,u,c)=>{const[l,f,p]=o,g=At(f);if(l===this.userId&&t.path.isEqual(g))return on(e).get(p).next((A=>{if(!A)throw B(61480,{zr:o,batchId:p});L(A.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:A.userId,batchId:p}),i.push(Wn(this.serializer,A))}));c.done()})).next((()=>i))}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ie(K);const s=[];return t.forEach((i=>{const o=qo(this.userId,i.path),u=IDBKeyRange.lowerBound(o),c=Kr(e).Hn({range:u},((l,f,p)=>{const[g,A,S]=l,D=At(A);g===this.userId&&i.path.isEqual(D)?r=r.add(S):p.done()}));s.push(c)})),R.waitFor(s).next((()=>this.jr(e,r)))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1,i=qo(this.userId,r),o=IDBKeyRange.lowerBound(i);let u=new ie(K);return Kr(e).Hn({range:o},((c,l,f)=>{const[p,g,A]=c,S=At(g);p===this.userId&&r.isPrefixOf(S)?S.length===s&&(u=u.add(A)):f.done()})).next((()=>this.jr(e,u)))}jr(e,t){const r=[],s=[];return t.forEach((i=>{s.push(on(e).get(i).next((o=>{if(o===null)throw B(35274,{batchId:i});L(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),r.push(Wn(this.serializer,o))})))})),R.waitFor(s).next((()=>r))}removeMutationBatch(e,t){return Bg(e.qr,this.userId,t).next((r=>(e.addOnCommittedListener((()=>{this.Hr(t.batchId)})),R.forEach(r,(s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))))}Hr(e){delete this.Kr[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return R.resolve();const r=IDBKeyRange.lowerBound((function(o){return[o]})(this.userId)),s=[];return Kr(e).Hn({range:r},((i,o,u)=>{if(i[0]===this.userId){const c=At(i[1]);s.push(c)}else u.done()})).next((()=>{L(s.length===0,56720,{Jr:s.map((i=>i.canonicalString()))})}))}))}containsKey(e,t){return zg(e,this.userId,t)}Yr(e){return Gg(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:nr,lastStreamToken:""}))}}function zg(n,e,t){const r=qo(e,t.path),s=r[1],i=IDBKeyRange.lowerBound(r);let o=!1;return Kr(n).Hn({range:i,jn:!0},((u,c,l)=>{const[f,p,g]=u;f===e&&p===s&&(o=!0),l.done()})).next((()=>o))}function on(n){return Pe(n,mt)}function Kr(n){return Pe(n,os)}function Gg(n){return Pe(n,Pi)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kR{getBundleMetadata(e,t){return yf(e).get(t).next((r=>{if(r)return(function(i){return{id:i.bundleId,createTime:Er(i.createTime),version:i.version}})(r)}))}saveBundleMetadata(e,t){return yf(e).put((function(s){return{bundleId:s.id,createTime:Tr(He(s.createTime)),version:s.version}})(t))}getNamedQuery(e,t){return If(e).get(t).next((r=>{if(r)return(function(i){return{name:i.name,query:jg(i.bundledQuery),readTime:Er(i.readTime)}})(r)}))}saveNamedQuery(e,t){return If(e).put((function(s){return{name:s.name,readTime:Tr(He(s.readTime)),bundledQuery:s.bundledQuery}})(t))}}function yf(n){return Pe(n,Ga)}function If(n){return Pe(n,Ha)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qa{constructor(e,t){this.serializer=e,this.userId=t}static Qr(e,t){const r=t.uid||"";return new Qa(e,r)}getOverlay(e,t){return Lr(e).get(gf(this.userId,t)).next((r=>r?vo(this.serializer,r):null))}getOverlays(e,t){const r=ut();return R.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=ut();return Lr(e).Hn(((s,i)=>{const o=vo(this.serializer,i);o.largestBatchId>t&&r.set(o.getKey(),o)})).next((()=>r))}saveOverlays(e,t,r){const s=[];return r.forEach(((i,o)=>{const u=new Tl(t,o);s.push(this.Zr(e,u))})),R.waitFor(s)}removeOverlaysForBatchId(e,t,r){const s=new Set;t.forEach((o=>s.add(Fe(o.getCollectionPath()))));const i=[];return s.forEach((o=>{const u=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);i.push(Lr(e).zn(hc,u))})),R.waitFor(i)}getOverlaysForCollection(e,t,r){const s=ut(),i=Fe(t),o=IDBKeyRange.bound([this.userId,i,r],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Lr(e).Qn(hc,o).next((u=>{for(const c of u){const l=vo(this.serializer,c);s.set(l.getKey(),l)}return s}))}getOverlaysForCollectionGroup(e,t,r,s){const i=ut();let o;const u=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Lr(e).Hn({index:Og,range:u},((c,l,f)=>{const p=vo(this.serializer,l);i.size()<s||p.largestBatchId===o?(i.set(p.getKey(),p),o=p.largestBatchId):f.done()})).next((()=>i))}Zr(e,t){return Lr(e).put((function(s,i,o){const[u,c,l]=gf(i,o.mutation.key);return{userId:i,collectionPath:c,documentId:l,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:oa(s.$r,o.mutation)}})(this.serializer,this.userId,t))}}function Lr(n){return Pe(n,Ka)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DR{Xr(e){return Pe(e,yl)}getSessionToken(e){return this.Xr(e).get("sessionToken").next((t=>{const r=t==null?void 0:t.value;return r?fe.fromUint8Array(r):fe.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Xr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qn{constructor(){}ei(e,t){this.ti(e,t),t.ni()}ti(e,t){if("nullValue"in e)this.ri(t,5);else if("booleanValue"in e)this.ri(t,10),t.ii(e.booleanValue?1:0);else if("integerValue"in e)this.ri(t,15),t.ii(ue(e.integerValue));else if("doubleValue"in e){const r=ue(e.doubleValue);isNaN(r)?this.ri(t,13):(this.ri(t,15),Zr(r)?t.ii(0):t.ii(r))}else if("timestampValue"in e){let r=e.timestampValue;this.ri(t,20),typeof r=="string"&&(r=zt(r)),t.si(`${r.seconds||""}`),t.ii(r.nanos||0)}else if("stringValue"in e)this._i(e.stringValue,t),this.oi(t);else if("bytesValue"in e)this.ri(t,30),t.ai(Gt(e.bytesValue)),this.oi(t);else if("referenceValue"in e)this.ui(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.ri(t,45),t.ii(r.latitude||0),t.ii(r.longitude||0)}else"mapValue"in e?fm(e)?this.ri(t,Number.MAX_SAFE_INTEGER):yr(e)?this.ci(e.mapValue,t):(this.li(e.mapValue,t),this.oi(t)):"arrayValue"in e?(this.Ei(e.arrayValue,t),this.oi(t)):B(19022,{hi:e})}_i(e,t){this.ri(t,25),this.Ti(e,t)}Ti(e,t){t.si(e)}li(e,t){const r=e.fields||{};this.ri(t,55);for(const s of Object.keys(r))this._i(s,t),this.ti(r[s],t)}ci(e,t){var o,u;const r=e.fields||{};this.ri(t,53);const s=_r,i=((u=(o=r[s].arrayValue)==null?void 0:o.values)==null?void 0:u.length)||0;this.ri(t,15),t.ii(ue(i)),this._i(s,t),this.ti(r[s],t)}Ei(e,t){const r=e.values||[];this.ri(t,50);for(const s of r)this.ti(s,t)}ui(e,t){this.ri(t,37),F.fromName(e).path.forEach((r=>{this.ri(t,60),this.Ti(r,t)}))}ri(e,t){e.ii(t)}oi(e){e.ii(2)}}Qn.Pi=new Qn;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mr=255;function OR(n){if(n===0)return 8;let e=0;return n>>4||(e+=4,n<<=4),n>>6||(e+=2,n<<=2),n>>7||(e+=1),e}function Tf(n){const e=64-(function(r){let s=0;for(let i=0;i<8;++i){const o=OR(255&r[i]);if(s+=o,o!==8)break}return s})(n);return Math.ceil(e/8)}class LR{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Ii(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ri(r.value),r=t.next();this.Ai()}Vi(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.di(r.value),r=t.next();this.fi()}mi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ri(r);else if(r<2048)this.Ri(960|r>>>6),this.Ri(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ri(480|r>>>12),this.Ri(128|63&r>>>6),this.Ri(128|63&r);else{const s=t.codePointAt(0);this.Ri(240|s>>>18),this.Ri(128|63&s>>>12),this.Ri(128|63&s>>>6),this.Ri(128|63&s)}}this.Ai()}pi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.di(r);else if(r<2048)this.di(960|r>>>6),this.di(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.di(480|r>>>12),this.di(128|63&r>>>6),this.di(128|63&r);else{const s=t.codePointAt(0);this.di(240|s>>>18),this.di(128|63&s>>>12),this.di(128|63&s>>>6),this.di(128|63&s)}}this.fi()}gi(e){const t=this.yi(e),r=Tf(t);this.wi(1+r),this.buffer[this.position++]=255&r;for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=255&t[s]}bi(e){const t=this.yi(e),r=Tf(t);this.wi(1+r),this.buffer[this.position++]=~(255&r);for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}Si(){this.Di(Mr),this.Di(255)}xi(){this.Ci(Mr),this.Ci(255)}reset(){this.position=0}seed(e){this.wi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Fi(){return this.buffer.slice(0,this.position)}yi(e){const t=(function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)})(e),r=!!(128&t[0]);t[0]^=r?255:128;for(let s=1;s<t.length;++s)t[s]^=r?255:0;return t}Ri(e){const t=255&e;t===0?(this.Di(0),this.Di(255)):t===Mr?(this.Di(Mr),this.Di(0)):this.Di(t)}di(e){const t=255&e;t===0?(this.Ci(0),this.Ci(255)):t===Mr?(this.Ci(Mr),this.Ci(0)):this.Ci(e)}Ai(){this.Di(0),this.Di(1)}fi(){this.Ci(0),this.Ci(1)}Di(e){this.wi(1),this.buffer[this.position++]=e}Ci(e){this.wi(1),this.buffer[this.position++]=~e}wi(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const s=new Uint8Array(r);s.set(this.buffer),this.buffer=s}}class MR{constructor(e){this.Oi=e}ai(e){this.Oi.Ii(e)}si(e){this.Oi.mi(e)}ii(e){this.Oi.gi(e)}ni(){this.Oi.Si()}}class UR{constructor(e){this.Oi=e}ai(e){this.Oi.Vi(e)}si(e){this.Oi.pi(e)}ii(e){this.Oi.bi(e)}ni(){this.Oi.xi()}}class Ms{constructor(){this.Oi=new LR,this.ascending=new MR(this.Oi),this.descending=new UR(this.Oi)}seed(e){this.Oi.seed(e)}Mi(e){return e===0?this.ascending:this.descending}Fi(){return this.Oi.Fi()}reset(){this.Oi.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn{constructor(e,t,r,s){this.Ni=e,this.Li=t,this.Bi=r,this.Ui=s}ki(){const e=this.Ui.length,t=e===0||this.Ui[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.Ui,0),t!==e?r.set([0],this.Ui.length):++r[r.length-1],new Yn(this.Ni,this.Li,this.Bi,r)}qi(e,t,r){return{indexId:this.Ni,uid:e,arrayValue:jo(this.Bi),directionalValue:jo(this.Ui),orderedDocumentKey:jo(t),documentKey:r.path.toArray()}}$i(e,t,r){const s=this.qi(e,t,r);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function an(n,e){let t=n.Ni-e.Ni;return t!==0?t:(t=Ef(n.Bi,e.Bi),t!==0?t:(t=Ef(n.Ui,e.Ui),t!==0?t:F.comparator(n.Li,e.Li)))}function Ef(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}function jo(n){return fp()?(function(t){let r="";for(let s=0;s<t.length;s++)r+=String.fromCharCode(t[s]);return r})(n):n}function wf(n){return typeof n!="string"?n:(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(n)}class vf{constructor(e){this.Ki=new ie(((t,r)=>Ae.comparator(t.field,r.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Qi=e.orderBy,this.Wi=[];for(const t of e.filters){const r=t;r.isInequality()?this.Ki=this.Ki.add(r):this.Wi.push(r)}}get Gi(){return this.Ki.size>1}zi(e){if(L(e.collectionGroup===this.collectionId,49279),this.Gi)return!1;const t=ec(e);if(t!==void 0&&!this.ji(t))return!1;const r=Gn(e);let s=new Set,i=0,o=0;for(;i<r.length&&this.ji(r[i]);++i)s=s.add(r[i].fieldPath.canonicalString());if(i===r.length)return!0;if(this.Ki.size>0){const u=this.Ki.getIterator().getNext();if(!s.has(u.field.canonicalString())){const c=r[i];if(!this.Hi(u,c)||!this.Ji(this.Qi[o++],c))return!1}++i}for(;i<r.length;++i){const u=r[i];if(o>=this.Qi.length||!this.Ji(this.Qi[o++],u))return!1}return!0}Yi(){if(this.Gi)return null;let e=new ie(Ae.comparator);const t=[];for(const r of this.Wi)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new Mo(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new Mo(r.field,0))}for(const r of this.Qi)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new Mo(r.field,r.dir==="asc"?0:1)));return new na(na.UNKNOWN_ID,this.collectionId,t,yi.empty())}ji(e){for(const t of this.Wi)if(this.Hi(t,e))return!0;return!1}Hi(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}Ji(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hg(n){var t,r;if(L(n instanceof ne||n instanceof oe,20012),n instanceof ne){if(n instanceof Vm){const s=((r=(t=n.value.arrayValue)==null?void 0:t.values)==null?void 0:r.map((i=>ne.create(n.field,"==",i))))||[];return oe.create(s,"or")}return n}const e=n.filters.map((s=>Hg(s)));return oe.create(e,n.op)}function FR(n){if(n.getFilters().length===0)return[];const e=gc(Hg(n));return L(Kg(e),7391),pc(e)||mc(e)?[e]:e.getFilters()}function pc(n){return n instanceof ne}function mc(n){return n instanceof oe&&jc(n)}function Kg(n){return pc(n)||mc(n)||(function(t){if(t instanceof oe&&Ju(t)){for(const r of t.getFilters())if(!pc(r)&&!mc(r))return!1;return!0}return!1})(n)}function gc(n){if(L(n instanceof ne||n instanceof oe,34018),n instanceof ne)return n;if(n.filters.length===1)return gc(n.filters[0]);const e=n.filters.map((r=>gc(r)));let t=oe.create(e,n.op);return t=pa(t),Kg(t)?t:(L(t instanceof oe,64498),L(is(t),40251),L(t.filters.length>1,57927),t.filters.reduce(((r,s)=>El(r,s))))}function El(n,e){let t;return L(n instanceof ne||n instanceof oe,38388),L(e instanceof ne||e instanceof oe,25473),t=n instanceof ne?e instanceof ne?(function(s,i){return oe.create([s,i],"and")})(n,e):Af(n,e):e instanceof ne?Af(e,n):(function(s,i){if(L(s.filters.length>0&&i.filters.length>0,48005),is(s)&&is(i))return Pm(s,i.getFilters());const o=Ju(s)?s:i,u=Ju(s)?i:s,c=o.filters.map((l=>El(l,u)));return oe.create(c,"or")})(n,e),pa(t)}function Af(n,e){if(is(e))return Pm(e,n.getFilters());{const t=e.filters.map((r=>El(n,r)));return oe.create(t,"or")}}function pa(n){if(L(n instanceof ne||n instanceof oe,11850),n instanceof ne)return n;const e=n.getFilters();if(e.length===1)return pa(e[0]);if(Am(n))return n;const t=e.map((s=>pa(s))),r=[];return t.forEach((s=>{s instanceof ne?r.push(s):s instanceof oe&&(s.op===n.op?r.push(...s.filters):r.push(s))})),r.length===1?r[0]:oe.create(r,n.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BR{constructor(){this.Zi=new wl}addToCollectionParentIndex(e,t){return this.Zi.add(t),R.resolve()}getCollectionParents(e,t){return R.resolve(this.Zi.getEntries(t))}addFieldIndex(e,t){return R.resolve()}deleteFieldIndex(e,t){return R.resolve()}deleteAllFieldIndexes(e){return R.resolve()}createTargetIndexes(e,t){return R.resolve()}getDocumentsMatchingTarget(e,t){return R.resolve(null)}getIndexType(e,t){return R.resolve(0)}getFieldIndexes(e,t){return R.resolve([])}getNextCollectionGroupToUpdate(e){return R.resolve(null)}getMinOffset(e,t){return R.resolve(ot.min())}getMinOffsetFromCollectionGroup(e,t){return R.resolve(ot.min())}updateCollectionGroup(e,t,r){return R.resolve()}updateIndexEntries(e,t){return R.resolve()}}class wl{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new ie(ee.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new ie(ee.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rf="IndexedDbIndexManager",Ao=new Uint8Array(0);class qR{constructor(e,t){this.databaseId=t,this.Xi=new wl,this.es=new Yt((r=>ra(r)),((r,s)=>Gc(r,s))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Xi.has(t)){const r=t.lastSegment(),s=t.popLast();e.addOnCommittedListener((()=>{this.Xi.add(t)}));const i={collectionId:r,parent:Fe(s)};return Pf(e).put(i)}return R.resolve()}getCollectionParents(e,t){const r=[],s=IDBKeyRange.bound([t,""],[sm(t),""],!1,!0);return Pf(e).Qn(s).next((i=>{for(const o of i){if(o.collectionId!==t)break;r.push(At(o.parent))}return r}))}addFieldIndex(e,t){const r=Us(e),s=(function(u){return{indexId:u.indexId,collectionGroup:u.collectionGroup,fields:u.fields.map((c=>[c.fieldPath.canonicalString(),c.kind]))}})(t);delete s.indexId;const i=r.add(s);if(t.indexState){const o=Fr(e);return i.next((u=>{o.put(_f(u,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return i.next()}deleteFieldIndex(e,t){const r=Us(e),s=Fr(e),i=Ur(e);return r.delete(t.indexId).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=Us(e),r=Ur(e),s=Fr(e);return t.zn().next((()=>r.zn())).next((()=>s.zn()))}createTargetIndexes(e,t){return R.forEach(this.ts(t),(r=>this.getIndexType(e,r).next((s=>{if(s===0||s===1){const i=new vf(r).Yi();if(i!=null)return this.addFieldIndex(e,i)}}))))}getDocumentsMatchingTarget(e,t){const r=Ur(e);let s=!0;const i=new Map;return R.forEach(this.ts(t),(o=>this.ns(e,o).next((u=>{s&&(s=!!u),i.set(o,u)})))).next((()=>{if(s){let o=Y();const u=[];return R.forEach(i,((c,l)=>{k(Rf,`Using index ${(function(q){return`id=${q.indexId}|cg=${q.collectionGroup}|f=${q.fields.map((Q=>`${Q.fieldPath}:${Q.kind}`)).join(",")}`})(c)} to execute ${ra(t)}`);const f=(function(q,Q){const X=ec(Q);if(X===void 0)return null;for(const Z of sa(q,X.fieldPath))switch(Z.op){case"array-contains-any":return Z.value.arrayValue.values||[];case"array-contains":return[Z.value]}return null})(l,c),p=(function(q,Q){const X=new Map;for(const Z of Gn(Q))for(const T of sa(q,Z.fieldPath))switch(T.op){case"==":case"in":X.set(Z.fieldPath.canonicalString(),T.value);break;case"not-in":case"!=":return X.set(Z.fieldPath.canonicalString(),T.value),Array.from(X.values())}return null})(l,c),g=(function(q,Q){const X=[];let Z=!0;for(const T of Gn(Q)){const _=T.kind===0?zd(q,T.fieldPath,q.startAt):Gd(q,T.fieldPath,q.startAt);X.push(_.value),Z&&(Z=_.inclusive)}return new ss(X,Z)})(l,c),A=(function(q,Q){const X=[];let Z=!0;for(const T of Gn(Q)){const _=T.kind===0?Gd(q,T.fieldPath,q.endAt):zd(q,T.fieldPath,q.endAt);X.push(_.value),Z&&(Z=_.inclusive)}return new ss(X,Z)})(l,c),S=this.rs(c,l,g),D=this.rs(c,l,A),N=this.ss(c,l,p),$=this._s(c.indexId,f,S,g.inclusive,D,A.inclusive,N);return R.forEach($,(j=>r.Gn(j,t.limit).next((q=>{q.forEach((Q=>{const X=F.fromSegments(Q.documentKey);o.has(X)||(o=o.add(X),u.push(X))}))}))))})).next((()=>u))}return R.resolve(null)}))}ts(e){let t=this.es.get(e);return t||(e.filters.length===0?t=[e]:t=FR(oe.create(e.filters,"and")).map((r=>tc(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt))),this.es.set(e,t),t)}_s(e,t,r,s,i,o,u){const c=(t!=null?t.length:1)*Math.max(r.length,i.length),l=c/(t!=null?t.length:1),f=[];for(let p=0;p<c;++p){const g=t?this.us(t[p/l]):Ao,A=this.cs(e,g,r[p%l],s),S=this.ls(e,g,i[p%l],o),D=u.map((N=>this.cs(e,g,N,!0)));f.push(...this.createRange(A,S,D))}return f}cs(e,t,r,s){const i=new Yn(e,F.empty(),t,r);return s?i:i.ki()}ls(e,t,r,s){const i=new Yn(e,F.empty(),t,r);return s?i.ki():i}ns(e,t){const r=new vf(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next((i=>{let o=null;for(const u of i)r.zi(u)&&(!o||u.fields.length>o.fields.length)&&(o=u);return o}))}getIndexType(e,t){let r=2;const s=this.ts(t);return R.forEach(s,(i=>this.ns(e,i).next((o=>{o?r!==0&&o.fields.length<(function(c){let l=new ie(Ae.comparator),f=!1;for(const p of c.filters)for(const g of p.getFlattenedFilters())g.field.isKeyField()||(g.op==="array-contains"||g.op==="array-contains-any"?f=!0:l=l.add(g.field));for(const p of c.orderBy)p.field.isKeyField()||(l=l.add(p.field));return l.size+(f?1:0)})(i)&&(r=1):r=0})))).next((()=>(function(o){return o.limit!==null})(t)&&s.length>1&&r===2?1:r))}Es(e,t){const r=new Ms;for(const s of Gn(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=r.Mi(s.kind);Qn.Pi.ei(i,o)}return r.Fi()}us(e){const t=new Ms;return Qn.Pi.ei(e,t.Mi(0)),t.Fi()}hs(e,t){const r=new Ms;return Qn.Pi.ei(fi(this.databaseId,t),r.Mi((function(i){const o=Gn(i);return o.length===0?0:o[o.length-1].kind})(e))),r.Fi()}ss(e,t,r){if(r===null)return[];let s=[];s.push(new Ms);let i=0;for(const o of Gn(e)){const u=r[i++];for(const c of s)if(this.Ts(t,o.fieldPath)&&Pn(u))s=this.Ps(s,o,u);else{const l=c.Mi(o.kind);Qn.Pi.ei(u,l)}}return this.Is(s)}rs(e,t,r){return this.ss(e,t,r.position)}Is(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].Fi();return t}Ps(e,t,r){const s=[...e],i=[];for(const o of r.arrayValue.values||[])for(const u of s){const c=new Ms;c.seed(u.Fi()),Qn.Pi.ei(o,c.Mi(t.kind)),i.push(c)}return i}Ts(e,t){return!!e.filters.find((r=>r instanceof ne&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in")))}getFieldIndexes(e,t){const r=Us(e),s=Fr(e);return(t?r.Qn(lc,IDBKeyRange.bound(t,t)):r.Qn()).next((i=>{const o=[];return R.forEach(i,(u=>s.get([u.indexId,this.uid]).next((c=>{o.push((function(f,p){const g=p?new yi(p.sequenceNumber,new ot(Er(p.readTime),new F(At(p.documentKey)),p.largestBatchId)):yi.empty(),A=f.fields.map((([S,D])=>new Mo(Ae.fromServerFormat(S),D)));return new na(f.indexId,f.collectionGroup,A,g)})(u,c))})))).next((()=>o))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((r,s)=>{const i=r.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:K(r.collectionGroup,s.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,r){const s=Us(e),i=Fr(e);return this.Rs(e).next((o=>s.Qn(lc,IDBKeyRange.bound(t,t)).next((u=>R.forEach(u,(c=>i.put(_f(c.indexId,this.uid,o,r))))))))}updateIndexEntries(e,t){const r=new Map;return R.forEach(t,((s,i)=>{const o=r.get(s.collectionGroup);return(o?R.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next((u=>(r.set(s.collectionGroup,u),R.forEach(u,(c=>this.As(e,s,c).next((l=>{const f=this.Vs(i,c);return l.isEqual(f)?R.resolve():this.ds(e,i,c,l,f)})))))))}))}fs(e,t,r,s){return Ur(e).put(s.qi(this.uid,this.hs(r,t.key),t.key))}ps(e,t,r,s){return Ur(e).delete(s.$i(this.uid,this.hs(r,t.key),t.key))}As(e,t,r){const s=Ur(e);let i=new ie(an);return s.Hn({index:Dg,range:IDBKeyRange.only([r.indexId,this.uid,jo(this.hs(r,t))])},((o,u)=>{i=i.add(new Yn(r.indexId,t,wf(u.arrayValue),wf(u.directionalValue)))})).next((()=>i))}Vs(e,t){let r=new ie(an);const s=this.Es(t,e);if(s==null)return r;const i=ec(t);if(i!=null){const o=e.data.field(i.fieldPath);if(Pn(o))for(const u of o.arrayValue.values||[])r=r.add(new Yn(t.indexId,e.key,this.us(u),s))}else r=r.add(new Yn(t.indexId,e.key,Ao,s));return r}ds(e,t,r,s,i){k(Rf,"Updating index entries for document '%s'",t.key);const o=[];return(function(c,l,f,p,g){const A=c.getIterator(),S=l.getIterator();let D=Dr(A),N=Dr(S);for(;D||N;){let $=!1,j=!1;if(D&&N){const q=f(D,N);q<0?j=!0:q>0&&($=!0)}else D!=null?j=!0:$=!0;$?(p(N),N=Dr(S)):j?(g(D),D=Dr(A)):(D=Dr(A),N=Dr(S))}})(s,i,an,(u=>{o.push(this.fs(e,t,r,u))}),(u=>{o.push(this.ps(e,t,r,u))})),R.waitFor(o)}Rs(e){let t=1;return Fr(e).Hn({index:kg,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((r,s,i)=>{i.done(),t=s.sequenceNumber+1})).next((()=>t))}createRange(e,t,r){r=r.sort(((o,u)=>an(o,u))).filter(((o,u,c)=>!u||an(o,c[u-1])!==0));const s=[];s.push(e);for(const o of r){const u=an(o,e),c=an(o,t);if(u===0)s[0]=e.ki();else if(u>0&&c<0)s.push(o),s.push(o.ki());else if(c>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.gs(s[o],s[o+1]))return[];const u=s[o].$i(this.uid,Ao,F.empty()),c=s[o+1].$i(this.uid,Ao,F.empty());i.push(IDBKeyRange.bound(u,c))}return i}gs(e,t){return an(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(bf)}getMinOffset(e,t){return R.mapArray(this.ts(t),(r=>this.ns(e,r).next((s=>s||B(44426))))).next(bf)}}function Pf(n){return Pe(n,Si)}function Ur(n){return Pe(n,ii)}function Us(n){return Pe(n,_l)}function Fr(n){return Pe(n,si)}function bf(n){L(n.length!==0,28825);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const s=n[r].indexState.offset;zc(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new ot(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wt{constructor(e){this.ys=e}next(){return this.ys+=2,this.ys}static ws(){return new Wt(0)}static bs(){return new Wt(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $R{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.Ss(e).next((t=>{const r=new Wt(t.highestTargetId);return t.highestTargetId=r.next(),this.vs(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.Ss(e).next((t=>z.fromTimestamp(new se(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.Ss(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,r){return this.Ss(e).next((s=>(s.highestListenSequenceNumber=t,r&&(s.lastRemoteSnapshotVersion=r.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.vs(e,s))))}addTargetData(e,t){return this.Ds(e,t).next((()=>this.Ss(e).next((r=>(r.targetCount+=1,this.xs(t,r),this.vs(e,r))))))}updateTargetData(e,t){return this.Ds(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>Br(e).delete(t.targetId))).next((()=>this.Ss(e))).next((r=>(L(r.targetCount>0,8065),r.targetCount-=1,this.vs(e,r))))}removeTargets(e,t,r){let s=0;const i=[];return Br(e).Hn(((o,u)=>{const c=Ks(this.serializer,u);c.sequenceNumber<=t&&r.get(c.targetId)===null&&(s++,i.push(this.removeTargetData(e,c)))})).next((()=>R.waitFor(i))).next((()=>s))}forEachTarget(e,t){return Br(e).Hn(((r,s)=>{const i=Ks(this.serializer,s);t(i)}))}Ss(e){return Sf(e).get(ha).next((t=>(L(t!==null,2888),t)))}vs(e,t){return Sf(e).put(ha,t)}Ds(e,t){return Br(e).put($g(this.serializer,t))}xs(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.Ss(e).next((t=>t.targetCount))}getTargetData(e,t){const r=za(t),s=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let i=null;return Br(e).Hn({range:s,index:Ng},((o,u,c)=>{const l=Ks(this.serializer,u);fl(t,l.target)&&(i=l,c.done())})).next((()=>i))}addMatchingKeys(e,t,r){const s=[],i=gn(e);return t.forEach((o=>{const u=Fe(o.path);s.push(i.put({targetId:r,path:u})),s.push(this.referenceDelegate.addReference(e,r,o))})),R.waitFor(s)}removeMatchingKeys(e,t,r){const s=gn(e);return R.forEach(t,(i=>{const o=Fe(i.path);return R.waitFor([s.delete([r,o]),this.referenceDelegate.removeReference(e,r,i)])}))}removeMatchingKeysForTargetId(e,t){const r=gn(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(s)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),s=gn(e);let i=Y();return s.Hn({range:r,jn:!0},((o,u,c)=>{const l=At(o[1]),f=new F(l);i=i.add(f)})).next((()=>i))}containsKey(e,t){const r=Fe(t.path),s=IDBKeyRange.bound([r],[sm(r)],!1,!0);let i=0;return gn(e).Hn({index:gl,jn:!0,range:s},(([o,u],c,l)=>{o!==0&&(i++,l.done())})).next((()=>i>0))}ye(e,t){return Br(e).get(t).next((r=>r?Ks(this.serializer,r):null))}}function Br(n){return Pe(n,as)}function Sf(n){return Pe(n,or)}function gn(n){return Pe(n,us)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jR{constructor(e,t){this.db=e,this.garbageCollector=ag(this,t)}ir(e){const t=this.Cs(e);return this.db.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Cs(e){let t=0;return this.sr(e,(r=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}sr(e,t){return this.Fs(e,((r,s)=>t(s)))}addReference(e,t,r){return Ro(e,r)}removeReference(e,t,r){return Ro(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return Ro(e,t)}Os(e,t){return(function(s,i){let o=!1;return Gg(s).Jn((u=>zg(s,u,i).next((c=>(c&&(o=!0),R.resolve(!c)))))).next((()=>o))})(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Fs(e,((o,u)=>{if(u<=t){const c=this.Os(e,o).next((l=>{if(!l)return i++,r.getEntry(e,o).next((()=>(r.removeEntry(o,z.min()),gn(e).delete((function(p){return[0,Fe(p.path)]})(o)))))}));s.push(c)}})).next((()=>R.waitFor(s))).next((()=>r.apply(e))).next((()=>i))}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return Ro(e,t)}Fs(e,t){const r=gn(e);let s,i=lt.wn;return r.Hn({index:gl},(([o,u],{path:c,sequenceNumber:l})=>{o===0?(i!==lt.wn&&t(new F(At(s)),i),i=l,s=c):i=lt.wn})).next((()=>{i!==lt.wn&&t(new F(At(s)),i)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Ro(n,e){return gn(n).put((function(r,s){return{targetId:0,path:Fe(r.path),sequenceNumber:s}})(e,n.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function Wg(n,e){var r;let t=e;for(const s of n.stages)t=zR({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},s,t);return t}function Ya(n,e){return Wg(n,[e]).length>0}function Qg(n,e){return Ie(n)?Ya(n,e):ka(n,e)}function zR(n,e,t){if(e instanceof zi)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()&&`/${u.key.getCollectionPath().canonicalString()}`===i.hr))})(0,e,t);if(e instanceof Hi)return(function(s,i,o){return o.filter((u=>{const c=ri(G(i.condition).evaluate(s,u));return c!==void 0&&pt(c,Ze)}))})(n,e,t);if(e instanceof Gi)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()&&u.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Ba)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()))})(0,0,t);if(e instanceof qa)return(function(s,i,o){return o.filter((u=>u.isFoundDocument()&&i.Pr.has(u.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof Vn)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof vt)return(function(s,i,o){const u=i.orderings.map((c=>({Ms:G(c.expr),direction:c.direction})));return[...o].sort(((c,l)=>{for(const{Ms:f,direction:p}of u){const g=ri(f.evaluate(s,c)),A=ri(f.evaluate(s,l)),S=Be(g??Vt,A??Vt);if(S!==0)return p==="ascending"?S:-S}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function _c(n){const e=(function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof vt)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const s of e){const i=ri(G(s.expr).evaluate({serializer:n.serializer},t)),o=ri(G(s.expr).evaluate({serializer:n.serializer},r)),u=Be(i||Vt,o||Vt);if(u!==0)return s.direction==="ascending"?u:-u}return 0}}function ku(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof Vn)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yg{constructor(){this.changes=new Yt((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,ge.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?R.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GR{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return un(e).put(r)}removeEntry(e,t,r){return un(e).delete((function(i,o){const u=i.path.toArray();return[u.slice(0,u.length-2),u[u.length-2],fa(o),u[u.length-1]]})(t,r))}updateMetadata(e,t){return this.getMetadata(e).next((r=>(r.byteSize+=t,this.Ns(e,r))))}getEntry(e,t){let r=ge.newInvalidDocument(t);return un(e).Hn({index:$o,range:IDBKeyRange.only(Fs(t))},((s,i)=>{r=this.Ls(t,i)})).next((()=>r))}Bs(e,t){let r={size:0,document:ge.newInvalidDocument(t)};return un(e).Hn({index:$o,range:IDBKeyRange.only(Fs(t))},((s,i)=>{r={document:this.Ls(t,i),size:da(i)}})).next((()=>r))}getEntries(e,t){let r=ve();return this.Us(e,t,((s,i)=>{const o=this.Ls(s,i);r=r.insert(s,o)})).next((()=>r))}getAllEntries(e){let t=ve();return un(e).Hn(((r,s)=>{const i=this.Ls(F.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);t=t.insert(i.key,i)})).next((()=>t))}ks(e,t){let r=ve(),s=new le(F.comparator);return this.Us(e,t,((i,o)=>{const u=this.Ls(i,o);r=r.insert(i,u),s=s.insert(i,da(o))})).next((()=>({documents:r,qs:s})))}Us(e,t,r){if(t.isEmpty())return R.resolve();let s=new ie(xf);t.forEach((c=>s=s.add(c)));const i=IDBKeyRange.bound(Fs(s.first()),Fs(s.last())),o=s.getIterator();let u=o.getNext();return un(e).Hn({index:$o,range:i},((c,l,f)=>{const p=F.fromSegments([...l.prefixPath,l.collectionGroup,l.documentId]);for(;u&&xf(u,p)<0;)r(u,null),u=o.getNext();u&&u.isEqual(p)&&(r(u,l),u=o.hasNext()?o.getNext():null),u?f.Kn(Fs(u)):f.done()})).next((()=>{for(;u;)r(u,null),u=o.hasNext()?o.getNext():null}))}getDocumentsMatchingQuery(e,t,r,s,i){const o=Ie(t)?ee.fromString(Ki(t)):t.path,u=[o.popLast().toArray(),o.lastSegment(),fa(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],c=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return un(e).Qn(IDBKeyRange.bound(u,c,!0)).next((l=>{i==null||i.incrementDocumentReadCount(l.length);let f=ve();for(const p of l){const g=this.Ls(F.fromSegments(p.prefixPath.concat(p.collectionGroup,p.documentId)),p);g.isFoundDocument()&&(Qg(t,g)||s.has(g.key))&&(f=f.insert(g.key,g))}return f}))}getAllFromCollectionGroup(e,t,r,s){let i=ve();const o=Cf(t,r),u=Cf(t,ot.max());return un(e).Hn({index:xg,range:IDBKeyRange.bound(o,u,!0)},((c,l,f)=>{const p=this.Ls(F.fromSegments(l.prefixPath.concat(l.collectionGroup,l.documentId)),l);i=i.insert(p.key,p),i.size===s&&f.done()})).next((()=>i))}newChangeBuffer(e){return new HR(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return Vf(e).get(cc).next((t=>(L(!!t,20021),t)))}Ns(e,t){return Vf(e).put(cc,t)}Ls(e,t){if(t){const r=xR(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(z.min())))return r}return ge.newInvalidDocument(e)}}function Xg(n){return new GR(n)}class HR extends Yg{constructor(e,t){super(),this.$s=e,this.trackRemovals=t,this.Ks=new Yt((r=>r.toString()),((r,s)=>r.isEqual(s)))}applyChanges(e){const t=[];let r=0,s=new ie(((i,o)=>K(i.canonicalString(),o.canonicalString())));return this.changes.forEach(((i,o)=>{const u=this.Ks.get(i);if(t.push(this.$s.removeEntry(e,i,u.readTime)),o.isValidDocument()){const c=mf(this.$s.serializer,o);s=s.add(i.path.popLast());const l=da(c);r+=l-u.size,t.push(this.$s.addEntry(e,i,c))}else if(r-=u.size,this.trackRemovals){const c=mf(this.$s.serializer,o.convertToNoDocument(z.min()));t.push(this.$s.addEntry(e,i,c))}})),s.forEach((i=>{t.push(this.$s.indexManager.addToCollectionParentIndex(e,i))})),t.push(this.$s.updateMetadata(e,r)),R.waitFor(t)}getFromCache(e,t){return this.$s.Bs(e,t).next((r=>(this.Ks.set(t,{size:r.size,readTime:r.document.readTime}),r.document)))}getAllFromCache(e,t){return this.$s.ks(e,t).next((({documents:r,qs:s})=>(s.forEach(((i,o)=>{this.Ks.set(i,{size:o,readTime:r.get(i).readTime})})),r)))}}function Vf(n){return Pe(n,bi)}function un(n){return Pe(n,la)}function Fs(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Cf(n,e){const t=e.documentKey.path.toArray();return[n,fa(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function xf(n,e){const t=n.path.toArray(),r=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<r.length-2;++i)if(s=K(t[i],r[i]),s)return s;return s=K(t.length,r.length),s||(s=K(t[t.length-2],r[r.length-2]),s||K(t[t.length-1],r[r.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jg{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&Xs(r.mutation,s,Ye.empty(),se.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,Y()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=Y()){const s=ut();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((i=>{let o=zr();return i.forEach(((u,c)=>{o=o.insert(u,c.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const r=ut();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,Y())))}populateOverlays(e,t,r){const s=[];return r.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,u)=>{t.set(o,u)}))}))}computeViews(e,t,r,s){let i=ve();const o=ei(),u=(function(){return ei()})();return t.forEach(((c,l)=>{const f=r.get(l.key);s.has(l.key)&&(f===void 0||f.mutation instanceof Qt)?i=i.insert(l.key,l):f!==void 0?(o.set(l.key,f.mutation.getFieldMask()),Xs(f.mutation,l,f.mutation.getFieldMask(),se.now())):o.set(l.key,Ye.empty())})),this.recalculateAndSaveOverlays(e,i).next((c=>(c.forEach(((l,f)=>o.set(l,f))),t.forEach(((l,f)=>u.set(l,new KR(f,o.get(l)??null)))),u)))}recalculateAndSaveOverlays(e,t){const r=ei();let s=new le(((o,u)=>o-u)),i=Y();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const u of o)u.keys().forEach((c=>{const l=t.get(c);if(l===null)return;let f=r.get(c)||Ye.empty();f=u.applyToLocalView(l,f),r.set(c,f);const p=(s.get(u.batchId)||Y()).add(c);s=s.insert(u.batchId,p)}))})).next((()=>{const o=[],u=s.getReverseIterator();for(;u.hasNext();){const c=u.getNext(),l=c.key,f=c.value,p=Om();f.forEach((g=>{if(!i.has(g)){const A=Tm(t.get(g),r.get(g));A!==null&&p.set(g,A),i=i.add(g)}})),o.push(this.documentOverlayCache.saveOverlays(e,l,p))}return R.waitFor(o)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return Ie(t)?this.getDocumentsMatchingPipeline(e,t,r,s):Pw(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):xm(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):R.resolve(ut());let u=_i,c=i;return o.next((l=>R.forEach(l,((f,p)=>(u<p.largestBatchId&&(u=p.largestBatchId),i.get(f)?R.resolve():this.remoteDocumentCache.getEntry(e,f).next((g=>{c=c.insert(f,g)}))))).next((()=>this.populateOverlays(e,l,i))).next((()=>this.computeViews(e,c,l,Y()))).next((f=>({batchId:u,changes:Dm(f)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new F(t)).next((r=>{let s=zr();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=zr();return this.indexManager.getCollectionParents(e,i).next((u=>R.forEach(u,(c=>{const l=(function(p,g){return new ps(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)})(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,l,r,s).next((f=>{f.forEach(((p,g)=>{o=o.insert(p,g)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(u=>ka(t,u)))))}getDocumentsMatchingPipeline(e,t,r,s){if(wn(t)==="collection_group"){const i=ol(t);let o=zr();return this.indexManager.getCollectionParents(e,i).next((u=>R.forEach(u,(c=>{const l=(function(p,g){const A=p.stages.map((S=>S instanceof Gi?new zi(g.canonicalString(),{}):S));return new Ue(p.serializer,A)})(t,c.child(i));return this.getDocumentsMatchingPipeline(e,l,r,s).next((f=>{f.forEach(((p,g)=>{o=o.insert(p,g)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((o=>{switch(i=o,wn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let u=Y();for(const c of uc(t))u=u.add(F.fromPath(c));return this.remoteDocumentCache.getEntries(e,u);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new O("invalid-argument",`Invalid pipeline source to execute offline: ${Bt(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(u=>Ya(t,u)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((i,o)=>{const u=o.getKey();t.get(u)===null&&(t=t.insert(u,ge.newInvalidDocument(u)))}));let s=zr();return t.forEach(((i,o)=>{const u=e.get(i);u!==void 0&&Xs(u.mutation,o,Ye.empty(),se.now()),r(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,r){switch(wn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ee.fromString(Ki(t)),r);case"collection_group":throw new O("invalid-argument",`Unexpected collection group pipeline: ${Bt(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,uc(t).map((s=>F.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new O("invalid-argument",`Failed to get overlays for pipeline: ${Bt(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WR{constructor(e){this.serializer=e,this.Qs=new Map,this.Ws=new Map}getBundleMetadata(e,t){return R.resolve(this.Qs.get(t))}saveBundleMetadata(e,t){return this.Qs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:He(s.createTime)}})(t)),R.resolve()}getNamedQuery(e,t){return R.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,(function(s){return{name:s.name,query:jg(s.bundledQuery),readTime:He(s.readTime)}})(t)),R.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QR{constructor(){this.overlays=new le(F.comparator),this.Gs=new Map}getOverlay(e,t){return R.resolve(this.overlays.get(t))}getOverlays(e,t){const r=ut();return R.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=ut();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&r.set(s,i)})),R.resolve(r)}saveOverlays(e,t,r){return r.forEach(((s,i)=>{this.Zr(e,t,i)})),R.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Gs.get(r);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Gs.delete(r)),R.resolve()}getOverlaysForCollection(e,t,r){const s=ut(),i=t.length+1,o=new F(t.child("")),u=this.overlays.getIteratorFrom(o);for(;u.hasNext();){const c=u.getNext().value,l=c.getKey();if(!t.isPrefixOf(l.path))break;l.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return R.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new le(((l,f)=>l-f));const o=this.overlays.getIterator();for(;o.hasNext();){const l=o.getNext().value;if(l.getKey().getCollectionGroup()===t&&l.largestBatchId>r){let f=i.get(l.largestBatchId);f===null&&(f=ut(),i=i.insert(l.largestBatchId,f)),f.set(l.getKey(),l)}}const u=ut(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach(((l,f)=>u.set(l,f))),!(u.size()>=s)););return R.resolve(u)}Zr(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Gs.get(s.largestBatchId).delete(r.key);this.Gs.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Tl(t,r));let i=this.Gs.get(t);i===void 0&&(i=Y(),this.Gs.set(t,i)),this.Gs.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YR{constructor(){this.sessionToken=fe.EMPTY_BYTE_STRING}getSessionToken(e){return R.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,R.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vl{constructor(){this.zs=new ie(Se.js),this.Hs=new ie(Se.Js)}isEmpty(){return this.zs.isEmpty()}addReference(e,t){const r=new Se(e,t);this.zs=this.zs.add(r),this.Hs=this.Hs.add(r)}Ys(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Zs(new Se(e,t))}Xs(e,t){e.forEach((r=>this.removeReference(r,t)))}e_(e){const t=new F(new ee([])),r=new Se(t,e),s=new Se(t,e+1),i=[];return this.Hs.forEachInRange([r,s],(o=>{this.Zs(o),i.push(o.key)})),i}t_(){this.zs.forEach((e=>this.Zs(e)))}Zs(e){this.zs=this.zs.delete(e),this.Hs=this.Hs.delete(e)}n_(e){const t=new F(new ee([])),r=new Se(t,e),s=new Se(t,e+1);let i=Y();return this.Hs.forEachInRange([r,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new Se(e,0),r=this.zs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Se{constructor(e,t){this.key=e,this.r_=t}static js(e,t){return F.comparator(e.key,t.key)||K(e.r_,t.r_)}static Js(e,t){return K(e.r_,t.r_)||F.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Gr=1,this.i_=new ie(Se.js)}checkEmpty(e){return R.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Gr;this.Gr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new pl(i,t,r,s);this.mutationQueue.push(o);for(const u of s)this.i_=this.i_.add(new Se(u.key,i)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return R.resolve(o)}lookupMutationBatch(e,t){return R.resolve(this.s_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.__(r),i=s<0?0:s;return R.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return R.resolve(this.mutationQueue.length===0?nr:this.Gr-1)}getAllMutationBatches(e){return R.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Se(t,0),s=new Se(t,Number.POSITIVE_INFINITY),i=[];return this.i_.forEachInRange([r,s],(o=>{const u=this.s_(o.r_);i.push(u)})),R.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ie(K);return t.forEach((s=>{const i=new Se(s,0),o=new Se(s,Number.POSITIVE_INFINITY);this.i_.forEachInRange([i,o],(u=>{r=r.add(u.r_)}))})),R.resolve(this.o_(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;F.isDocumentKey(i)||(i=i.child(""));const o=new Se(new F(i),0);let u=new ie(K);return this.i_.forEachWhile((c=>{const l=c.key.path;return!!r.isPrefixOf(l)&&(l.length===s&&(u=u.add(c.r_)),!0)}),o),R.resolve(this.o_(u))}o_(e){const t=[];return e.forEach((r=>{const s=this.s_(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){L(this.a_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.i_;return R.forEach(t.mutations,(s=>{const i=new Se(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.i_=r}))}Hr(e){}containsKey(e,t){const r=new Se(t,0),s=this.i_.firstAfterOrEqual(r);return R.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,R.resolve()}a_(e,t){return this.__(e)}__(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}s_(e){const t=this.__(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JR{constructor(e){this.u_=e,this.docs=(function(){return new le(F.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.u_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return R.resolve(r?r.document.mutableCopy():ge.newInvalidDocument(t))}getEntries(e,t){let r=ve();return t.forEach((s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():ge.newInvalidDocument(s))})),R.resolve(r)}getAllEntries(e){let t=ve();return this.docs.forEach(((r,s)=>{t=t.insert(r,s.document)})),R.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,o;Ie(t)?(i=ee.fromString(Ki(t)),o=f=>Ya(t,f)):(i=t.path,o=f=>ka(t,f));let u=ve();const c=new F(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:f,value:{document:p}}=l.getNext();if(!i.isPrefixOf(f.path))break;f.path.length>i.length+1||zc(Cm(p),r)<=0||(s.has(p.key)||o(p))&&(u=u.insert(p.key,p.mutableCopy()))}return R.resolve(u)}getAllFromCollectionGroup(e,t,r,s){B(9500)}c_(e,t){return R.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new ZR(this)}getSize(e){return R.resolve(this.size)}}class ZR extends Yg{constructor(e){super(),this.$s=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.$s.addEntry(e,s)):this.$s.removeEntry(r)})),R.waitFor(t)}getFromCache(e,t){return this.$s.getEntry(e,t)}getAllFromCache(e,t){return this.$s.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eP{constructor(e){this.persistence=e,this.l_=new Yt((t=>za(t)),fl),this.lastRemoteSnapshotVersion=z.min(),this.highestTargetId=0,this.E_=0,this.h_=new vl,this.targetCount=0,this.T_=Wt.ws()}forEachTarget(e,t){return this.l_.forEach(((r,s)=>t(s))),R.resolve()}getLastRemoteSnapshotVersion(e){return R.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return R.resolve(this.E_)}allocateTargetId(e){return this.highestTargetId=this.T_.next(),R.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.E_&&(this.E_=t),R.resolve()}Ds(e){this.l_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.T_=new Wt(t),this.highestTargetId=t),e.sequenceNumber>this.E_&&(this.E_=e.sequenceNumber)}addTargetData(e,t){return this.Ds(t),this.targetCount+=1,R.resolve()}updateTargetData(e,t){return this.Ds(t),R.resolve()}removeTargetData(e,t){return this.l_.delete(t.target),this.h_.e_(t.targetId),this.targetCount-=1,R.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.l_.forEach(((o,u)=>{u.sequenceNumber<=t&&r.get(u.targetId)===null&&(this.l_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,u.targetId)),s++)})),R.waitFor(i).next((()=>s))}getTargetCount(e){return R.resolve(this.targetCount)}getTargetData(e,t){const r=this.l_.get(t)||null;return R.resolve(r)}addMatchingKeys(e,t,r){return this.h_.Ys(t,r),R.resolve()}removeMatchingKeys(e,t,r){this.h_.Xs(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),R.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.h_.e_(t),R.resolve()}getMatchingKeysForTargetId(e,t){const r=this.h_.n_(t);return R.resolve(r)}containsKey(e,t){return R.resolve(this.h_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Al{constructor(e,t){this.P_={},this.overlays={},this.I_=new lt(0),this.R_=!1,this.R_=!0,this.A_=new YR,this.referenceDelegate=e(this),this.V_=new eP(this),this.indexManager=new BR,this.remoteDocumentCache=(function(s){return new JR(s)})((r=>this.referenceDelegate.d_(r))),this.serializer=new qg(t),this.f_=new WR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new QR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.P_[e.toKey()];return r||(r=new XR(t,this.referenceDelegate),this.P_[e.toKey()]=r),r}getGlobalsCache(){return this.A_}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.f_}runTransaction(e,t,r){k("MemoryPersistence","Starting transaction:",e);const s=new tP(this.I_.next());return this.referenceDelegate.m_(),r(s).next((i=>this.referenceDelegate.p_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}g_(e,t){return R.or(Object.values(this.P_).map((r=>()=>r.containsKey(e,t))))}}class tP extends sg{constructor(e){super(),this.currentSequenceNumber=e}}class Xa{constructor(e){this.persistence=e,this.y_=new vl,this.w_=null}static b_(e){return new Xa(e)}get S_(){if(this.w_)return this.w_;throw B(60996)}addReference(e,t,r){return this.y_.addReference(r,t),this.S_.delete(r.toString()),R.resolve()}removeReference(e,t,r){return this.y_.removeReference(r,t),this.S_.add(r.toString()),R.resolve()}markPotentiallyOrphaned(e,t){return this.S_.add(t.toString()),R.resolve()}removeTarget(e,t){this.y_.e_(t.targetId).forEach((s=>this.S_.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.S_.add(i.toString())))})).next((()=>r.removeTargetData(e,t)))}m_(){this.w_=new Set}p_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return R.forEach(this.S_,(r=>{const s=F.fromPath(r);return this.v_(e,s).next((i=>{i||t.removeEntry(s,z.min())}))})).next((()=>(this.w_=null,t.apply(e))))}updateLimboDocument(e,t){return this.v_(e,t).next((r=>{r?this.S_.delete(t.toString()):this.S_.add(t.toString())}))}d_(e){return 0}v_(e,t){return R.or([()=>R.resolve(this.y_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.g_(e,t)])}}class ma{constructor(e,t){this.persistence=e,this.D_=new Yt((r=>Fe(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=ag(this,t)}static b_(e,t){return new ma(e,t)}m_(){}p_(e){return R.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}ir(e){const t=this.Cs(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Cs(e){let t=0;return this.sr(e,(r=>{t++})).next((()=>t))}sr(e,t){return R.forEach(this.D_,((r,s)=>this.Os(e,r,s).next((i=>i?R.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.c_(e,(o=>this.Os(e,o,t).next((u=>{u||(r++,i.removeEntry(o,z.min()))})))).next((()=>i.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.D_.set(t,e.currentSequenceNumber),R.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),R.resolve()}removeReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),R.resolve()}updateLimboDocument(e,t){return this.D_.set(t,e.currentSequenceNumber),R.resolve()}d_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Oo(e.data.value)),t}Os(e,t,r){return R.or([()=>this.persistence.g_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.D_.get(t);return R.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nP{constructor(e){this.serializer=e}Nn(e,t,r,s){const i=new La("createOrUpgrade",t);r<1&&s>=1&&((function(c){c.createObjectStore(Qi)})(e),(function(c){c.createObjectStore(Pi,{keyPath:oR}),c.createObjectStore(mt,{keyPath:ff,autoIncrement:!0}).createIndex(er,pf,{unique:!0}),c.createObjectStore(os)})(e),Nf(e),(function(c){c.createObjectStore(Hn)})(e));let o=R.resolve();return r<3&&s>=3&&(r!==0&&((function(c){c.deleteObjectStore(us),c.deleteObjectStore(as),c.deleteObjectStore(or)})(e),Nf(e)),o=o.next((()=>(function(c){const l=c.store(or),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:z.min().toTimestamp(),targetCount:0};return l.put(ha,f)})(i)))),r<4&&s>=4&&(r!==0&&(o=o.next((()=>(function(c,l){return l.store(mt).Qn().next((p=>{c.deleteObjectStore(mt),c.createObjectStore(mt,{keyPath:ff,autoIncrement:!0}).createIndex(er,pf,{unique:!0});const g=l.store(mt),A=p.map((S=>g.put(S)));return R.waitFor(A)}))})(e,i)))),o=o.next((()=>{(function(c){c.createObjectStore(cs,{keyPath:mR})})(e)}))),r<5&&s>=5&&(o=o.next((()=>this.x_(i)))),r<6&&s>=6&&(o=o.next((()=>((function(c){c.createObjectStore(bi)})(e),this.C_(i))))),r<7&&s>=7&&(o=o.next((()=>this.F_(i)))),r<8&&s>=8&&(o=o.next((()=>this.O_(e,i)))),r<9&&s>=9&&(o=o.next((()=>{(function(c){c.objectStoreNames.contains("remoteDocumentChanges")&&c.deleteObjectStore("remoteDocumentChanges")})(e)}))),r<10&&s>=10&&(o=o.next((()=>this.M_(i)))),r<11&&s>=11&&(o=o.next((()=>{(function(c){c.createObjectStore(Ga,{keyPath:gR})})(e),(function(c){c.createObjectStore(Ha,{keyPath:_R})})(e)}))),r<12&&s>=12&&(o=o.next((()=>{(function(c){const l=c.createObjectStore(Ka,{keyPath:AR});l.createIndex(hc,RR,{unique:!1}),l.createIndex(Og,PR,{unique:!1})})(e)}))),r<13&&s>=13&&(o=o.next((()=>(function(c){const l=c.createObjectStore(la,{keyPath:uR});l.createIndex($o,cR),l.createIndex(xg,lR)})(e))).next((()=>this.N_(e,i))).next((()=>e.deleteObjectStore(Hn)))),r<14&&s>=14&&(o=o.next((()=>this.L_(e,i)))),r<15&&s>=15&&(o=o.next((()=>(function(c){c.createObjectStore(_l,{keyPath:yR,autoIncrement:!0}).createIndex(lc,IR,{unique:!1}),c.createObjectStore(si,{keyPath:TR}).createIndex(kg,ER,{unique:!1}),c.createObjectStore(ii,{keyPath:wR}).createIndex(Dg,vR,{unique:!1})})(e)))),r<16&&s>=16&&(o=o.next((()=>{t.objectStore(si).clear()})).next((()=>{t.objectStore(ii).clear()}))),r<17&&s>=17&&(o=o.next((()=>{(function(c){c.createObjectStore(yl,{keyPath:bR})})(e)}))),r<18&&s>=18&&fp()&&(o=o.next((()=>{t.objectStore(si).clear()})).next((()=>{t.objectStore(ii).clear()}))),o}C_(e){let t=0;return e.store(Hn).Hn(((r,s)=>{t+=da(s)})).next((()=>{const r={byteSize:t};return e.store(bi).put(cc,r)}))}x_(e){const t=e.store(Pi),r=e.store(mt);return t.Qn().next((s=>R.forEach(s,(i=>{const o=IDBKeyRange.bound([i.userId,nr],[i.userId,i.lastAcknowledgedBatchId]);return r.Qn(er,o).next((u=>R.forEach(u,(c=>{L(c.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:c.batchId});const l=Wn(this.serializer,c);return Bg(e,i.userId,l).next((()=>{}))}))))}))))}F_(e){const t=e.store(us),r=e.store(Hn);return e.store(or).get(ha).next((s=>{const i=[];return r.Hn(((o,u)=>{const c=new ee(o),l=(function(p){return[0,Fe(p)]})(c);i.push(t.get(l).next((f=>f?R.resolve():(p=>t.put({targetId:0,path:Fe(p),sequenceNumber:s.highestListenSequenceNumber}))(c))))})).next((()=>R.waitFor(i)))}))}O_(e,t){e.createObjectStore(Si,{keyPath:pR});const r=t.store(Si),s=new wl,i=o=>{if(s.add(o)){const u=o.lastSegment(),c=o.popLast();return r.put({collectionId:u,parent:Fe(c)})}};return t.store(Hn).Hn({jn:!0},((o,u)=>{const c=new ee(o);return i(c.popLast())})).next((()=>t.store(os).Hn({jn:!0},(([o,u,c],l)=>{const f=At(u);return i(f.popLast())}))))}M_(e){const t=e.store(as);return t.Hn(((r,s)=>{const i=Ks(this.serializer,s),o=$g(this.serializer,i);return t.put(o)}))}N_(e,t){const r=t.store(Hn),s=[];return r.Hn(((i,o)=>{const u=t.store(la),c=(function(p){return p.document?new F(ee.fromString(p.document.name).popFirst(5)):p.noDocument?F.fromSegments(p.noDocument.path):p.unknownDocument?F.fromSegments(p.unknownDocument.path):B(36783)})(o).path.toArray(),l={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(u.put(l))})).next((()=>R.waitFor(s)))}L_(e,t){const r=t.store(mt),s=Xg(this.serializer),i=new Al(Xa.b_,this.serializer.$r);return r.Qn().next((o=>{const u=new Map;return o.forEach((c=>{let l=u.get(c.userId)??Y();Wn(this.serializer,c).keys().forEach((f=>l=l.add(f))),u.set(c.userId,l)})),R.forEach(u,((c,l)=>{const f=new Ne(l),p=Qa.Qr(this.serializer,f),g=i.getIndexManager(f),A=Wa.Qr(f,this.serializer,g,i.referenceDelegate);return new Jg(s,A,p,g).recalculateAndSaveOverlaysForDocumentKeys(new dc(t,lt.wn),c).next()}))}))}}function Nf(n){n.createObjectStore(us,{keyPath:dR}).createIndex(gl,fR,{unique:!0}),n.createObjectStore(as,{keyPath:"targetId"}).createIndex(Ng,hR,{unique:!0}),n.createObjectStore(or)}const cn="IndexedDbPersistence",Du=18e5,Ou=5e3,Lu="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",rP="main";class Rl{constructor(e,t,r,s,i,o,u,c,l,f,p=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.Ct=i,this.window=o,this.document=u,this.B_=l,this.U_=f,this.k_=p,this.I_=null,this.R_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.q_=null,this.inForeground=!1,this.K_=null,this.Q_=null,this.W_=Number.NEGATIVE_INFINITY,this.G_=g=>Promise.resolve(),!Rl.Ye())throw new O(C.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new jR(this,s),this.z_=t+rP,this.serializer=new qg(c),this.j_=new Tn(this.z_,this.k_,new nP(this.serializer)),this.A_=new DR,this.V_=new $R(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Xg(this.serializer),this.f_=new kR,this.window&&this.window.localStorage?this.H_=this.window.localStorage:(this.H_=null,f===!1&&Ge(cn,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.J_().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new O(C.FAILED_PRECONDITION,Lu);return this.Y_(),this.Z_(),this.X_(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.V_.getHighestSequenceNumber(e)))})).then((e=>{this.I_=new lt(e,this.B_)})).then((()=>{this.R_=!0})).catch((e=>(this.j_&&this.j_.close(),Promise.reject(e))))}eo(e){return this.G_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.j_.Bn((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Ct.enqueueAndForget((async()=>{this.started&&await this.J_()})))}J_(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>Po(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.no(e).next((t=>{t||(this.isPrimary=!1,this.Ct.enqueueRetryable((()=>this.G_(!1))))}))})).next((()=>this.ro(e))).next((t=>this.isPrimary&&!t?this.io(e).next((()=>!1)):!!t&&this.so(e).next((()=>!0)))))).catch((e=>{if(Mn(e))return k(cn,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return k(cn,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.Ct.enqueueRetryable((()=>this.G_(e))),this.isPrimary=e}))}no(e){return Bs(e).get(Or).next((t=>R.resolve(this._o(t))))}oo(e){return Po(e).delete(this.clientId)}async ao(){if(this.isPrimary&&!this.uo(this.W_,Du)){this.W_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const r=Pe(t,cs);return r.Qn().next((s=>{const i=this.co(s,Du),o=s.filter((u=>i.indexOf(u)===-1));return R.forEach(o,(u=>r.delete(u.clientId))).next((()=>o))}))})).catch((()=>[]));if(this.H_)for(const t of e)this.H_.removeItem(this.lo(t.clientId))}}X_(){this.Q_=this.Ct.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.J_().then((()=>this.ao())).then((()=>this.X_()))))}_o(e){return!!e&&e.ownerId===this.clientId}ro(e){return this.U_?R.resolve(!0):Bs(e).get(Or).next((t=>{if(t!==null&&this.uo(t.leaseTimestampMs,Ou)&&!this.Eo(t.ownerId)){if(this._o(t)&&this.networkEnabled)return!0;if(!this._o(t)){if(!t.allowTabSynchronization)throw new O(C.FAILED_PRECONDITION,Lu);return!1}}return!(!this.networkEnabled||!this.inForeground)||Po(e).Qn().next((r=>this.co(r,Ou).find((s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,u=this.networkEnabled===s.networkEnabled;if(i||o&&u)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&k(cn,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.R_=!1,this.ho(),this.Q_&&(this.Q_.cancel(),this.Q_=null),this.To(),this.Po(),await this.j_.runTransaction("shutdown","readwrite",[Qi,cs],(e=>{const t=new dc(e,lt.wn);return this.io(t).next((()=>this.oo(t)))})),this.j_.close(),this.Io()}co(e,t){return e.filter((r=>this.uo(r.updateTimeMs,t)&&!this.Eo(r.clientId)))}Ro(){return this.runTransaction("getActiveClients","readonly",(e=>Po(e).Qn().next((t=>this.co(t,Du).map((r=>r.clientId))))))}get started(){return this.R_}getGlobalsCache(){return this.A_}getMutationQueue(e,t){return Wa.Qr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new qR(e,this.serializer.$r.databaseId)}getDocumentOverlayCache(e){return Qa.Qr(this.serializer,e)}getBundleCache(){return this.f_}runTransaction(e,t,r){k(cn,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=(function(c){return c===18?CR:c===17?Fg:c===16?VR:c===15?Il:c===14?Ug:c===13?Mg:c===12?SR:c===11?Lg:void B(60245)})(this.k_);let o;return this.j_.runTransaction(e,s,i,(u=>(o=new dc(u,this.I_?this.I_.next():lt.wn),t==="readwrite-primary"?this.no(o).next((c=>!!c||this.ro(o))).next((c=>{if(!c)throw Ge(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Ct.enqueueRetryable((()=>this.G_(!1))),new O(C.FAILED_PRECONDITION,rg);return r(o)})).next((c=>this.so(o).next((()=>c)))):this.Ao(o).next((()=>r(o)))))).then((u=>(o.raiseOnCommittedEvent(),u)))}Ao(e){return Bs(e).get(Or).next((t=>{if(t!==null&&this.uo(t.leaseTimestampMs,Ou)&&!this.Eo(t.ownerId)&&!this._o(t)&&!(this.U_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new O(C.FAILED_PRECONDITION,Lu)}))}so(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Bs(e).put(Or,t)}static Ye(){return Tn.Ye()}io(e){const t=Bs(e);return t.get(Or).next((r=>this._o(r)?(k(cn,"Releasing primary lease."),t.delete(Or)):R.resolve()))}uo(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(Ge(`Detected an update time that is in the future: ${e} > ${r}`),!1))}Y_(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.K_=()=>{this.Ct.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.J_())))},this.document.addEventListener("visibilitychange",this.K_),this.inForeground=this.document.visibilityState==="visible")}To(){this.K_&&(this.document.removeEventListener("visibilitychange",this.K_),this.K_=null)}Z_(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.q_=()=>{this.ho();const t=/(?:Version|Mobile)\/1[456]/;dp()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Ct.enterRestrictedMode(!0),this.Ct.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.q_))}Po(){this.q_&&(this.window.removeEventListener("pagehide",this.q_),this.q_=null)}Eo(e){var t;try{const r=((t=this.H_)==null?void 0:t.getItem(this.lo(e)))!==null;return k(cn,`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return Ge(cn,"Failed to get zombied client id.",r),!1}}ho(){if(this.H_)try{this.H_.setItem(this.lo(this.clientId),String(Date.now()))}catch(e){Ge("Failed to set zombie client id.",e)}}Io(){if(this.H_)try{this.H_.removeItem(this.lo(this.clientId))}catch{}}lo(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Bs(n){return Pe(n,Qi)}function Po(n){return Pe(n,cs)}function sP(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pl{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Vo=r,this.fo=s}static mo(e,t){let r=Y(),s=Y();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Pl(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iP(n,e){return F.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oP{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zg{constructor(){this.po=!1,this.yo=!1,this.wo=100,this.bo=(function(){return dp()?8:ig(Re())>0?6:4})()}initialize(e,t){this.So=e,this.indexManager=t,this.po=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.vo(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.Do(e,t,s,r).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new oP;return this.xo(e,t,o).next((u=>{if(i.result=u,this.yo)return this.Co(e,t,o,u.size)}))})).next((()=>i.result))}Co(e,t,r,s){return Ie(t)?R.resolve():r.documentReadCount<this.wo?($r()<=te.DEBUG&&k("QueryEngine","SDK will not create cache indexes for query:",Zs(t),"since it only creates cache indexes for collection contains","more than or equal to",this.wo,"documents"),R.resolve()):($r()<=te.DEBUG&&k("QueryEngine","Query:",Zs(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.bo*s?($r()<=te.DEBUG&&k("QueryEngine","The SDK decides to create cache indexes for query:",Zs(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ht(t))):R.resolve())}vo(e,t){if(Ie(t))return R.resolve(null);let r=t;if(Hd(r))return R.resolve(null);let s=ht(r);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(r.limit!==null&&i===1&&(r=ia(r,null,"F"),s=ht(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const u=Y(...o);return this.So.getDocuments(e,u).next((c=>this.indexManager.getMinOffset(e,s).next((l=>{const f=this.Fo(r,c);return this.Oo(r,f,u,l.readTime)?this.vo(e,ia(r,null,"F")):this.Mo(e,f,r,l)}))))})))))}Do(e,t,r,s){return(Ie(t)?(function(o){for(const u of o.stages){if(u instanceof Vn||u instanceof lf)return!1;if(u instanceof Hi){if(u.condition instanceof yg&&u.condition._expr.name==="exists"&&u.condition._expr.params[0]instanceof br&&u.condition._expr.params[0].fieldName===Et)continue;return!1}}return!0})(t):Hd(t))||s.isEqual(z.min())?R.resolve(null):this.So.getDocuments(e,r).next((i=>{const o=this.Fo(t,i);return this.Oo(t,o,r,s)?R.resolve(null):($r()<=te.DEBUG&&k("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),hf(t)),this.Mo(e,o,t,vw(s,_i)).next((u=>u)))}))}Fo(e,t){let r,s;return Ie(e)?(r=new ie(iP),s=i=>Ya(e,i)):(r=new ie(Kc(e)),s=i=>ka(e,i)),t.forEach(((i,o)=>{s(o)&&(r=r.add(o))})),r}Oo(e,t,r,s){if(Ie(e))return(function(u){return u.stages.some((c=>c instanceof Vn||c instanceof lf))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}xo(e,t,r){return $r()<=te.DEBUG&&k("QueryEngine","Using full collection scan to execute query:",hf(t)),this.So.getDocumentsMatchingQuery(e,t,ot.min(),r)}Mo(e,t,r,s){return this.So.getDocumentsMatchingQuery(e,r,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bl="LocalStore",aP=3e8;class uP{constructor(e,t,r,s){this.persistence=e,this.No=t,this.serializer=s,this.Lo=new le(K),this.Bo=new Yt((i=>za(i)),fl),this.Uo=new Map,this.ko=e.getRemoteDocumentCache(),this.V_=e.getTargetCache(),this.f_=e.getBundleCache(),this.qo(r)}qo(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Jg(this.ko,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.ko.setIndexManager(this.indexManager),this.No.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.Lo)))}}function e_(n,e,t,r){return new uP(n,e,t,r)}async function t_(n,e){const t=W(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((i=>(s=i,t.qo(e),t.mutationQueue.getAllMutationBatches(r)))).next((i=>{const o=[],u=[];let c=Y();for(const l of s){o.push(l.batchId);for(const f of l.mutations)c=c.add(f.key)}for(const l of i){u.push(l.batchId);for(const f of l.mutations)c=c.add(f.key)}return t.localDocuments.getDocuments(r,c).next((l=>({$o:l,removedBatchIds:o,addedBatchIds:u})))}))}))}function cP(n,e){const t=W(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),i=t.ko.newChangeBuffer({trackRemovals:!0});return(function(u,c,l,f){const p=l.batch,g=p.keys();let A=R.resolve();return g.forEach((S=>{A=A.next((()=>f.getEntry(c,S))).next((D=>{const N=l.docVersions.get(S);L(N!==null,48541),D.version.compareTo(N)<0&&(p.applyToRemoteDocument(D,l),D.isValidDocument()&&(D.setReadTime(l.commitVersion),f.addEntry(D)))}))})),A.next((()=>u.mutationQueue.removeMutationBatch(c,p)))})(t,r,e,i).next((()=>i.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(u){let c=Y();for(let l=0;l<u.mutationResults.length;++l)u.mutationResults[l].transformResults.length>0&&(c=c.add(u.batch.mutations[l].key));return c})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function n_(n){const e=W(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.V_.getLastRemoteSnapshotVersion(t)))}function lP(n,e){const t=W(n),r=e.snapshotVersion;let s=t.Lo;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.ko.newChangeBuffer({trackRemovals:!0});s=t.Lo;const u=[];e.targetChanges.forEach(((f,p)=>{const g=s.get(p);if(!g)return;u.push(t.V_.removeMatchingKeys(i,f.removedDocuments,p).next((()=>t.V_.addMatchingKeys(i,f.addedDocuments,p))));let A=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?A=A.withResumeToken(fe.EMPTY_BYTE_STRING,z.min()).withLastLimboFreeSnapshotVersion(z.min()):f.resumeToken.approximateByteSize()>0&&(A=A.withResumeToken(f.resumeToken,r)),s=s.insert(p,A),(function(D,N,$){return D.resumeToken.approximateByteSize()===0||N.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=aP?!0:$.addedDocuments.size+$.modifiedDocuments.size+$.removedDocuments.size>0})(g,A,f)&&u.push(t.V_.updateTargetData(i,A))}));let c=ve(),l=Y();if(e.documentUpdates.forEach((f=>{e.resolvedLimboDocuments.has(f)&&u.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))})),u.push(hP(i,o,e.documentUpdates).next((f=>{c=f.Ko,l=f.Qo}))),!r.isEqual(z.min())){const f=t.V_.getLastRemoteSnapshotVersion(i).next((p=>t.V_.setTargetsMetadata(i,i.currentSequenceNumber,r)));u.push(f)}return R.waitFor(u).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,c,l))).next((()=>c))})).then((i=>(t.Lo=s,i)))}function hP(n,e,t){let r=Y(),s=Y();return t.forEach((i=>r=r.add(i))),e.getEntries(n,r).next((i=>{let o=ve();return t.forEach(((u,c)=>{const l=i.get(u);c.isFoundDocument()!==l.isFoundDocument()&&(s=s.add(u)),c.isNoDocument()&&c.version.isEqual(z.min())?(e.removeEntry(u,c.readTime),o=o.insert(u,c)):!l.isValidDocument()||c.version.compareTo(l.version)>0||c.version.compareTo(l.version)===0&&l.hasPendingWrites?(e.addEntry(c),o=o.insert(u,c)):k(bl,"Ignoring outdated watch update for ",u,". Current version:",l.version," Watch version:",c.version)})),{Ko:o,Qo:s}}))}function dP(n,e){const t=W(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=nr),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function fP(n,e){const t=W(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.V_.getTargetData(r,e).next((i=>i?(s=i,R.resolve(s)):t.V_.allocateTargetId(r).next((o=>(s=new Rt(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.V_.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.Lo.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Lo=t.Lo.insert(r.targetId,r),t.Bo.set(e,r.targetId)),r}))}async function yc(n,e,t){const r=W(n),s=r.Lo.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,(o=>r.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!Mn(o))throw o;k(bl,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Lo=r.Lo.remove(e),r.Bo.delete(s.target)}function kf(n,e,t){const r=W(n);let s=z.min(),i=Y();return r.persistence.runTransaction("Execute query","readwrite",(o=>(function(c,l,f){const p=W(c),g=p.Bo.get(f);return g!==void 0?R.resolve(p.Lo.get(g)):p.V_.getTargetData(l,f)})(r,o,Ie(e)?e:ht(e)).next((u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,r.V_.getMatchingKeysForTargetId(o,u.targetId).next((c=>{i=c}))})).next((()=>r.No.getDocumentsMatchingQuery(o,e,t?s:z.min(),t?i:Y()))).next((u=>(pP(r,u),{documents:u,Wo:i})))))}function pP(n,e){e.forEach(((t,r)=>{const s=r.key.getCollectionGroup(),i=n.Uo.get(s)||z.min();r.readTime.compareTo(i)>0&&n.Uo.set(s,r.readTime)}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mP{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Yo=0,this.Zo=null,this.Xo=!0}ea(){this.Yo===0&&(this.ta("Unknown"),this.Zo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Zo=null,this.na("Backend didn't respond within 10 seconds."),this.ta("Offline"),Promise.resolve()))))}ra(e){this.state==="Online"?this.ta("Unknown"):(this.Yo++,this.Yo>=1&&(this.ia(),this.na(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ta("Offline")))}set(e){this.ia(),this.Yo=0,e==="Online"&&(this.Xo=!1),this.ta(e)}ta(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}na(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Xo?(Ge(t),this.Xo=!1):k("OnlineStateTracker",t)}ia(){this.Zo!==null&&(this.Zo.cancel(),this.Zo=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kt="RemoteStore";class gP{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.sa=[],this._a=new Map,this.oa=new Map,this.aa=new Map,this.ua=new Wt(1e3),this.ca=new Wt(1001),this.la=new Set,this.Ea=[],this.ha=i,this.ha.Qe((o=>{r.enqueueAndForget((async()=>{Vr(this)&&(k(kt,"Restarting streams for network reachability change."),await(async function(c){const l=W(c);l.la.add(4),await Yi(l),l.Ta.set("Unknown"),l.la.delete(4),await Ja(l)})(this))}))})),this.Ta=new mP(r,s)}}async function Ja(n){if(Vr(n))for(const e of n.Ea)await e(!0)}async function Yi(n){for(const e of n.Ea)await e(!1)}function Ic(n,e){return n.oa.get(e)||void 0}function r_(n,e){const t=W(n),r=Ic(t,e.targetId);if(r!==void 0&&t._a.has(r))return;const s=(function(u,c){const l=Ic(u,c);l!==void 0&&u.aa.delete(l);const f=(function(g,A){return A%2!=0?g.ca.next():g.ua.next()})(u,c);return u.oa.set(c,f),u.aa.set(f,c),f})(t,e.targetId);k(kt,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new Rt(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t._a.set(s,i),xl(t)?Cl(t):_s(t).Yt()&&Vl(t,i)}function Sl(n,e){const t=W(n),r=_s(t),s=Ic(t,e);k(kt,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t._a.delete(s),t.oa.delete(e),t.aa.delete(s),r.Yt()&&s_(t,s),t._a.size===0&&(r.Yt()?r.en():Vr(t)&&t.Ta.set("Unknown"))}function Vl(n,e){if(n.Pa.J(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(z.min())>0){const t=n.aa.get(e.targetId);if(t===void 0)return void k(kt,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}_s(n).Pn(e)}function s_(n,e){n.Pa.J(e),_s(n).In(e)}function Cl(n){n.Pa=new Bw({getRemoteKeysForTarget:e=>{const t=n.aa.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):Y()},ye:e=>n._a.get(e)||null,Ve:()=>n.datastore.serializer.databaseId}),_s(n).start(),n.Ta.ea()}function xl(n){return Vr(n)&&!_s(n).Jt()&&n._a.size>0}function Vr(n){return W(n).la.size===0}function i_(n){n.Pa=void 0}async function _P(n){n.Ta.set("Online")}async function yP(n){n._a.forEach(((e,t)=>{Vl(n,e)}))}async function IP(n,e){i_(n),xl(n)?(n.Ta.ra(e),Cl(n)):n.Ta.set("Unknown")}async function TP(n,e,t){if(n.Ta.set("Online"),e instanceof Mm&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const u of i.targetIds){if(s._a.has(u)){const c=s.aa.get(u);c!==void 0&&(await s.remoteSyncer.rejectListen(c,o),s.oa.delete(c),s.aa.delete(u)),s._a.delete(u)}s.Pa.removeTarget(u)}})(n,e)}catch(r){k(kt,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ga(n,r)}else if(e instanceof Uo?n.Pa._e(e):e instanceof Lm?n.Pa.he(e):n.Pa.ue(e),!t.isEqual(z.min()))try{const r=await n_(n.localStore);t.compareTo(r)>=0&&await(function(i,o){const u=i.Pa.fe(o);u.targetChanges.forEach(((l,f)=>{if(l.resumeToken.approximateByteSize()>0){const p=i._a.get(f);p&&i._a.set(f,p.withResumeToken(l.resumeToken,o))}})),u.targetMismatches.forEach(((l,f)=>{const p=i._a.get(l);if(!p)return;i._a.set(l,p.withResumeToken(fe.EMPTY_BYTE_STRING,p.snapshotVersion)),s_(i,l);const g=new Rt(p.target,l,f,p.sequenceNumber);Vl(i,g)}));const c=(function(f,p){const g=new Map;p.targetChanges.forEach(((S,D)=>{const N=f.aa.get(D);N!==void 0&&g.set(N,S)}));let A=new le(K);return p.targetMismatches.forEach(((S,D)=>{const N=f.aa.get(S);N!==void 0&&(A=A.insert(N,D))})),new qi(p.snapshotVersion,g,A,p.documentUpdates,p.augmentedDocumentUpdates,p.resolvedLimboDocuments)})(i,u);return i.remoteSyncer.applyRemoteEvent(c)})(n,t)}catch(r){k(kt,"Failed to raise snapshot:",r),await ga(n,r)}}async function ga(n,e,t){if(!Mn(e))throw e;n.la.add(1),await Yi(n),n.Ta.set("Offline"),t||(t=()=>n_(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{k(kt,"Retrying IndexedDB access"),await t(),n.la.delete(1),await Ja(n)}))}function o_(n,e){return e().catch((t=>ga(n,t,e)))}async function Xi(n){const e=W(n),t=xn(e);let r=e.sa.length>0?e.sa[e.sa.length-1].batchId:nr;for(;EP(e);)try{const s=await dP(e.localStore,r);if(s===null){e.sa.length===0&&t.en();break}r=s.batchId,wP(e,s)}catch(s){await ga(e,s)}a_(e)&&u_(e)}function EP(n){return Vr(n)&&n.sa.length<10}function wP(n,e){n.sa.push(e);const t=xn(n);t.Yt()&&t.Rn&&t.An(e.mutations)}function a_(n){return Vr(n)&&!xn(n).Jt()&&n.sa.length>0}function u_(n){xn(n).start()}async function vP(n){xn(n).fn()}async function AP(n){const e=xn(n);for(const t of n.sa)e.An(t.mutations)}async function RP(n,e,t){const r=n.sa.shift(),s=ml.from(r,e,t);await o_(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await Xi(n)}async function PP(n,e){e&&xn(n).Rn&&await(async function(r,s){if((function(o){return Nw(o)&&o!==C.ABORTED})(s.code)){const i=r.sa.shift();xn(r).Xt(),await o_(r,(()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Xi(r)}})(n,e),a_(n)&&u_(n)}async function Df(n,e){const t=W(n);t.asyncQueue.verifyOperationInProgress(),k(kt,"RemoteStore received new credentials");const r=Vr(t);t.la.add(3),await Yi(t),r&&t.Ta.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.la.delete(3),await Ja(t)}async function bP(n,e){const t=W(n);e?(t.la.delete(2),await Ja(t)):e||(t.la.add(2),await Yi(t),t.Ta.set("Unknown"))}function _s(n){return n.Ia||(n.Ia=(function(t,r,s){const i=W(t);return i.pn(),new hv(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:_P.bind(null,n),Et:yP.bind(null,n),Tt:IP.bind(null,n),Tn:TP.bind(null,n)}),n.Ea.push((async e=>{e?(n.Ia.Xt(),xl(n)?Cl(n):n.Ta.set("Unknown")):(await n.Ia.stop(),i_(n))}))),n.Ia}function xn(n){return n.Ra||(n.Ra=(function(t,r,s){const i=W(t);return i.pn(),new dv(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:()=>Promise.resolve(),Et:vP.bind(null,n),Tt:PP.bind(null,n),Vn:AP.bind(null,n),dn:RP.bind(null,n)}),n.Ea.push((async e=>{e?(n.Ra.Xt(),await Xi(n)):(await n.Ra.stop(),n.sa.length>0&&(k(kt,`Stopping write stream with ${n.sa.length} pending writes`),n.sa=[]))}))),n.Ra}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nl{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Aa(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Aa(this.observer.error,e):Ge("Uncaught Error in snapshot listener:",e.toString()))}Va(){this.muted=!0}Aa(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kl{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new xt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,u=new kl(e,t,o,s,i);return u.start(r),u}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new O(C.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Dl(n,e){if(Ge("AsyncQueue",`${e}: ${n}`),Mn(n))return new O(C.UNAVAILABLE,`${e}: ${n}`);throw n}const oi="IndexBackfiller";class SP{constructor(e,t){this.asyncQueue=e,this.Da=t,this.task=null}start(){this.xa(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}xa(e){k(oi,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.Da.Ca();k(oi,`Documents written: ${t}`)}catch(t){Mn(t)?k(oi,"Ignoring IndexedDB error during index backfill: ",t):await Rr(t)}await this.xa(6e4)}))}}class VP{constructor(e,t){this.localStore=e,this.persistence=t}async Ca(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.Fa(t,e)))}Fa(e,t){const r=new Set;let s=t,i=!0;return R.doWhile((()=>i===!0&&s>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((o=>{if(o!==null&&!r.has(o))return k(oi,`Processing collection: ${o}`),this.Oa(e,o,s).next((u=>{s-=u,r.add(o)}));i=!1})))).next((()=>t-s))}Oa(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((s=>this.localStore.localDocuments.getNextDocuments(e,t,s,r).next((i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next((()=>this.Ma(s,i))).next((u=>(k(oi,`Updating offset: ${u}`),this.localStore.indexManager.updateCollectionGroup(e,t,u)))).next((()=>o.size))}))))}Ma(e,t){let r=e;return t.changes.forEach(((s,i)=>{const o=Cm(i);zc(o,r)>0&&(r=o)})),new ot(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}class Of{constructor(){this.activeTargetIds=Mw()}Ba(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ua(e){this.activeTargetIds=this.activeTargetIds.delete(e)}La(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class c_{constructor(){this.fu=new Of,this.mu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.fu.Ba(e),this.mu[e]||"not-current"}updateQueryState(e,t,r){this.mu[e]=t}removeLocalQueryTarget(e){this.fu.Ua(e)}isLocalQueryTarget(e){return this.fu.activeTargetIds.has(e)}clearQueryState(e){delete this.mu[e]}getAllActiveQueryTargets(){return this.fu.activeTargetIds}isActiveQueryTarget(e){return this.fu.activeTargetIds.has(e)}start(){return this.fu=new Of,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CP(){return typeof window<"u"?window:null}function zo(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{static emptySet(e){return new ar(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||F.comparator(t.key,r.key):(t,r)=>F.comparator(t.key,r.key),this.keyedMap=zr(),this.sortedSet=new le(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof ar)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new ar;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lf{constructor(){this.pu=new le(F.comparator)}track(e){const t=e.doc.key,r=this.pu.get(t);r?e.type!==0&&r.type===3?this.pu=this.pu.insert(t,e):e.type===3&&r.type!==1?this.pu=this.pu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.pu=this.pu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.pu=this.pu.remove(t):e.type===1&&r.type===2?this.pu=this.pu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):B(63341,{we:e,gu:r}):this.pu=this.pu.insert(t,e)}yu(){const e=[];return this.pu.inorderTraversal(((t,r)=>{e.push(r)})),e}}class ls{constructor(e,t,r,s,i,o,u,c,l){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=u,this.excludesMetadataChanges=c,this.hasCachedResults=l}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach((u=>{o.push({type:0,doc:u})})),new ls(e,t,ar.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ja(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xP{constructor(){this.wu=void 0,this.bu=[]}Su(){return this.bu.some((e=>e.vu()))}}class NP{constructor(){this.queries=Mf(),this.onlineState="Unknown",this.Du=new Set}terminate(){(function(t,r){const s=W(t),i=s.queries;s.queries=Mf(),i.forEach(((o,u)=>{for(const c of u.bu)c.onError(r)}))})(this,new O(C.ABORTED,"Firestore shutting down"))}}function Mf(){return new Yt((n=>Vg(n)),ja)}async function Ol(n,e){const t=W(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.Su()&&e.vu()&&(r=2):(i=new xP,r=e.vu()?0:1);try{switch(r){case 0:i.wu=await t.onListen(s,!0);break;case 1:i.wu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const u=Dl(o,`Initialization of query '${Ie(e.query)?Bt(e.query):Zs(e.query)}' failed`);return void e.onError(u)}t.queries.set(s,i),i.bu.push(e),e.xu(t.onlineState),i.wu&&e.Cu(i.wu)&&Ml(t)}async function Ll(n,e){const t=W(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.bu.indexOf(e);o>=0&&(i.bu.splice(o,1),i.bu.length===0?s=e.vu()?0:1:!i.Su()&&e.vu()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function kP(n,e){const t=W(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const u of o.bu)u.Cu(s)&&(r=!0);o.wu=s}}r&&Ml(t)}function DP(n,e,t){const r=W(n),s=r.queries.get(e);if(s)for(const i of s.bu)i.onError(t);r.queries.delete(e)}function Ml(n){n.Du.forEach((e=>{e.next()}))}var Tc;(function(n){n.Default="default",n.Cache="cache"})(Tc||(Tc={}));class Ul{constructor(e,t,r){this.query=e,this.Fu=t,this.Ou=!1,this.Mu=null,this.onlineState="Unknown",this.options=r||{}}Cu(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new ls(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Ou?this.Nu(e)&&(this.Fu.next(e),t=!0):this.Lu(e,this.onlineState)&&(this.Bu(e),t=!0),this.Mu=e,t}onError(e){this.Fu.error(e)}xu(e){this.onlineState=e;let t=!1;return this.Mu&&!this.Ou&&this.Lu(this.Mu,e)&&(this.Bu(this.Mu),t=!0),t}Lu(e,t){if(!e.fromCache||!this.vu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Nu(e){if(e.docChanges.length>0)return!0;const t=this.Mu&&this.Mu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Bu(e){e=ls.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ou=!0,this.Fu.next(e)}vu(){return this.options.source!==Tc.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l_{constructor(e){this.key=e}}class h_{constructor(e){this.key=e}}class OP{constructor(e,t){this.query=e,this.zu=t,this.ju=null,this.hasCachedResults=!1,this.current=!1,this.Hu=Y(),this.mutatedKeys=Y(),this.Ju=Ie(e)?_c(e):Kc(e),this.Yu=new ar(this.Ju)}get Zu(){return this.zu}Xu(e,t){const r=t?t.ec:new Lf,s=t?t.Yu:this.Yu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,u=!1;const[c,l]=this.tc(this.query,s);e.inorderTraversal(((p,g)=>{const A=s.get(p),S=Qg(this.query,g)?g:null,D=!!A&&this.mutatedKeys.has(A.key),N=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let $=!1;A&&S?A.data.isEqual(S.data)?D!==N&&(r.track({type:3,doc:S}),$=!0):this.nc(A,S)||(r.track({type:2,doc:S}),$=!0,(c&&this.Ju(S,c)>0||l&&this.Ju(S,l)<0)&&(u=!0)):!A&&S?(r.track({type:0,doc:S}),$=!0):A&&!S&&(r.track({type:1,doc:A}),$=!0,(c||l)&&(u=!0)),$&&(S?(o=o.add(S),i=N?i.add(p):i.delete(p)):(o=o.delete(p),i=i.delete(p)))}));const f=this.rc(this.query);if(f)if(Ie(this.query)){const p=[];o.forEach((S=>p.push(S)));const g=Wg(this.query,p);let A=new ar(_c(this.query));for(const S of g)A=A.add(S);o.forEach((S=>{A.has(S.key)||(i=i.delete(S.key),r.track({type:1,doc:S}))})),o=A}else{const p=this.sc(this.query);for(;o.size>f;){const g=p==="F"?o.last():o.first();o=o.delete(g.key),i=i.delete(g.key),r.track({type:1,doc:g})}}return{Yu:o,ec:r,Oo:u,mutatedKeys:i}}rc(e){var t;return Ie(e)?(t=ku(e))==null?void 0:t.limit:e.limit||void 0}sc(e){if(Ie(e)){const t=ku(e);return t&&t.limit<0?"L":"F"}return e.limitType}tc(e,t){var r;if(Ie(e)){const s=(r=ku(e))==null?void 0:r.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.rc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.rc(this.query)?t.first():null]}nc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Yu;this.Yu=e.Yu,this.mutatedKeys=e.mutatedKeys;const o=e.ec.yu();o.sort(((f,p)=>(function(A,S){const D=N=>{switch(N){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return B(20277,{we:N})}};return D(A)-D(S)})(f.type,p.type)||this.Ju(f.doc,p.doc))),this._c(r),s=s??!1;const u=t&&!s?this.oc():[],c=this.Hu.size===0&&this.current&&!s?1:0,l=c!==this.ju;return this.ju=c,o.length!==0||l?{snapshot:new ls(this.query,e.Yu,i,o,e.mutatedKeys,c===0,l,!1,!!r&&r.resumeToken.approximateByteSize()>0),ac:u}:{ac:u}}xu(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Yu:this.Yu,ec:new Lf,mutatedKeys:this.mutatedKeys,Oo:!1},!1)):{ac:[]}}uc(e){return!this.zu.has(e)&&!!this.Yu.has(e)&&!this.Yu.get(e).hasLocalMutations}_c(e){e&&(e.addedDocuments.forEach((t=>this.zu=this.zu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.zu=this.zu.delete(t))),this.current=e.current)}oc(){if(!this.current)return[];const e=this.Hu;this.Hu=Y(),this.Yu.forEach((r=>{this.uc(r.key)&&(this.Hu=this.Hu.add(r.key))}));const t=[];return e.forEach((r=>{this.Hu.has(r)||t.push(new h_(r))})),this.Hu.forEach((r=>{e.has(r)||t.push(new l_(r))})),t}cc(e){this.zu=e.Wo,this.Hu=Y();const t=this.Xu(e.documents);return this.applyChanges(t,!0)}lc(){return ls.fromInitialDocuments(this.query,this.Yu,this.mutatedKeys,this.ju===0,this.hasCachedResults)}}const Fl="SyncEngine";class LP{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class MP{constructor(e){this.key=e,this.Ec=!1}}class UP{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.hc={},this.Tc=new Yt((u=>Vg(u)),ja),this.Pc=new Map,this.Ic=new Set,this.Rc=new le(F.comparator),this.Ac=new Map,this.Vc=new vl,this.dc={},this.fc=new Map,this.mc=Wt.bs(),this.onlineState="Unknown",this.gc=void 0}get isPrimaryClient(){return this.gc===!0}}async function FP(n,e,t=!0){const r=__(n);let s;const i=r.Tc.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lc()):s=await d_(r,e,t,!0),s}async function BP(n,e){const t=__(n);await d_(t,e,!0,!1)}async function d_(n,e,t,r){const s=await fP(n.localStore,Ie(e)?e:ht(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let u;return r&&(u=await qP(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&r_(n.remoteStore,s),u}async function qP(n,e,t,r,s){n.yc=(p,g,A)=>(async function(D,N,$,j){let q=N.view.Xu($);q.Oo&&(q=await kf(D.localStore,N.query,!1).then((({documents:T})=>N.view.Xu(T,q))));const Q=j&&j.targetChanges.get(N.targetId),X=j&&j.targetMismatches.get(N.targetId)!=null,Z=N.view.applyChanges(q,D.isPrimaryClient,Q,X);return Ff(D,N.targetId,Z.ac),Z.snapshot})(n,p,g,A);const i=await kf(n.localStore,e,!0),o=new OP(e,i.Wo),u=o.Xu(i.documents),c=$i.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),l=o.applyChanges(u,n.isPrimaryClient,c);Ff(n,t,l.ac);const f=new LP(e,t,o);return n.Tc.set(e,f),n.Pc.has(t)?n.Pc.get(t).push(e):n.Pc.set(t,[e]),l.snapshot}async function $P(n,e,t){const r=W(n),s=r.Tc.get(e),i=r.Pc.get(s.targetId);if(i.length>1)return r.Pc.set(s.targetId,i.filter((o=>!ja(o,e)))),void r.Tc.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await yc(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&Sl(r.remoteStore,s.targetId),Ec(r,s.targetId)})).catch(Rr)):(Ec(r,s.targetId),await yc(r.localStore,s.targetId,!0))}async function jP(n,e){const t=W(n),r=t.Tc.get(e),s=t.Pc.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Sl(t.remoteStore,r.targetId))}async function zP(n,e,t){const r=y_(n);try{const s=await(function(o,u){const c=W(o),l=se.now(),f=u.reduce(((A,S)=>A.add(S.key)),Y());let p,g;return c.persistence.runTransaction("Locally write mutations","readwrite",(A=>{let S=ve(),D=Y();return c.ko.getEntries(A,f).next((N=>{S=N,S.forEach((($,j)=>{j.isValidDocument()||(D=D.add($))}))})).next((()=>c.localDocuments.getOverlayedDocuments(A,S))).next((N=>{p=N;const $=[];for(const j of u){const q=mw(j,p.get(j.key).overlayedDocument);q!=null&&$.push(new Qt(j.key,q,mm(q.value.mapValue),Ce.exists(!0)))}return c.mutationQueue.addMutationBatch(A,l,$,u)})).next((N=>{g=N;const $=N.applyToLocalDocumentSet(p,D);return c.documentOverlayCache.saveOverlays(A,N.batchId,$)}))})).then((()=>({batchId:g.batchId,changes:Dm(p)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(o,u,c){let l=o.dc[o.currentUser.toKey()];l||(l=new le(K)),l=l.insert(u,c),o.dc[o.currentUser.toKey()]=l})(r,s.batchId,t),await Ji(r,s.changes),await Xi(r.remoteStore)}catch(s){const i=Dl(s,"Failed to persist write");t.reject(i)}}async function f_(n,e){const t=W(n);try{const r=await lP(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.Ac.get(i);o&&(L(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.Ec=!0:s.modifiedDocuments.size>0?L(o.Ec,14607):s.removedDocuments.size>0&&(L(o.Ec,42227),o.Ec=!1))})),await Ji(t,r,e)}catch(r){await Rr(r)}}function Uf(n,e,t){const r=W(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Tc.forEach(((i,o)=>{const u=o.view.xu(e);u.snapshot&&s.push(u.snapshot)})),(function(o,u){const c=W(o);c.onlineState=u;let l=!1;c.queries.forEach(((f,p)=>{for(const g of p.bu)g.xu(u)&&(l=!0)})),l&&Ml(c)})(r.eventManager,e),s.length&&r.hc.Tn(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function GP(n,e,t){const r=W(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Ac.get(e),i=s&&s.key;if(i){let o=new le(F.comparator);o=o.insert(i,ge.newNoDocument(i,z.min()));const u=Y().add(i),c=new qi(z.min(),new Map,new le(K),o,ve(),u);await f_(r,c),r.Rc=r.Rc.remove(i),r.Ac.delete(e),Bl(r)}else await yc(r.localStore,e,!1).then((()=>Ec(r,e,t))).catch(Rr)}async function HP(n,e){const t=W(n),r=e.batch.batchId;try{const s=await cP(t.localStore,e);m_(t,r,null),p_(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Ji(t,s)}catch(s){await Rr(s)}}async function KP(n,e,t){const r=W(n);try{const s=await(function(o,u){const c=W(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",(l=>{let f;return c.mutationQueue.lookupMutationBatch(l,u).next((p=>(L(p!==null,37113),f=p.keys(),c.mutationQueue.removeMutationBatch(l,p)))).next((()=>c.mutationQueue.performConsistencyCheck(l))).next((()=>c.documentOverlayCache.removeOverlaysForBatchId(l,f,u))).next((()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(l,f))).next((()=>c.localDocuments.getDocuments(l,f)))}))})(r.localStore,e);m_(r,e,t),p_(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Ji(r,s)}catch(s){await Rr(s)}}function p_(n,e){(n.fc.get(e)||[]).forEach((t=>{t.resolve()})),n.fc.delete(e)}function m_(n,e,t){const r=W(n);let s=r.dc[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.dc[r.currentUser.toKey()]=s}}function Ec(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Pc.get(e))n.Tc.delete(r),t&&n.hc.wc(r,t);n.Pc.delete(e),n.isPrimaryClient&&n.Vc.e_(e).forEach((r=>{n.Vc.containsKey(r)||g_(n,r)}))}function g_(n,e){n.Ic.delete(e.path.canonicalString());const t=n.Rc.get(e);t!==null&&(Sl(n.remoteStore,t),n.Rc=n.Rc.remove(e),n.Ac.delete(t),Bl(n))}function Ff(n,e,t){for(const r of t)r instanceof l_?(n.Vc.addReference(r.key,e),WP(n,r)):r instanceof h_?(k(Fl,"Document no longer in limbo: "+r.key),n.Vc.removeReference(r.key,e),n.Vc.containsKey(r.key)||g_(n,r.key)):B(19791,{bc:r})}function WP(n,e){const t=e.key,r=t.path.canonicalString();n.Rc.get(t)||n.Ic.has(r)||(k(Fl,"New document in limbo: "+t),n.Ic.add(r),Bl(n))}function Bl(n){for(;n.Ic.size>0&&n.Rc.size<n.maxConcurrentLimboResolutions;){const e=n.Ic.values().next().value;n.Ic.delete(e);const t=new F(ee.fromString(e)),r=n.mc.next();n.Ac.set(r,new MP(t)),n.Rc=n.Rc.insert(t,r),r_(n.remoteStore,new Rt(ht(Bi(t.path)),r,"TargetPurposeLimboResolution",lt.wn))}}async function Ji(n,e,t){const r=W(n),s=[],i=[],o=[];r.Tc.isEmpty()||(r.Tc.forEach(((u,c)=>{o.push(r.yc(c,e,t).then((l=>{var f;if((l||t)&&r.isPrimaryClient){const p=l?!l.fromCache:(f=t==null?void 0:t.targetChanges.get(c.targetId))==null?void 0:f.current;r.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(l){s.push(l);const p=Pl.mo(c.targetId,l);i.push(p)}})))})),await Promise.all(o),r.hc.Tn(s),await(async function(c,l){const f=W(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",(p=>R.forEach(l,(g=>R.forEach(g.Vo,(A=>f.persistence.referenceDelegate.addReference(p,g.targetId,A))).next((()=>R.forEach(g.fo,(A=>f.persistence.referenceDelegate.removeReference(p,g.targetId,A)))))))))}catch(p){if(!Mn(p))throw p;k(bl,"Failed to update sequence numbers: "+p)}for(const p of l){const g=p.targetId;if(!p.fromCache){const A=f.Lo.get(g),S=A.snapshotVersion,D=A.withLastLimboFreeSnapshotVersion(S);f.Lo=f.Lo.insert(g,D)}}})(r.localStore,i))}async function QP(n,e){const t=W(n);if(!t.currentUser.isEqual(e)){k(Fl,"User change. New user:",e.toKey());const r=await t_(t.localStore,e);t.currentUser=e,(function(i,o){i.fc.forEach((u=>{u.forEach((c=>{c.reject(new O(C.CANCELLED,o))}))})),i.fc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ji(t,r.$o)}}function YP(n,e){const t=W(n),r=t.Ac.get(e);if(r&&r.Ec)return Y().add(r.key);{let s=Y();const i=t.Pc.get(e);if(!i)return s;for(const o of i??[]){const u=t.Tc.get(o);s=s.unionWith(u.view.Zu)}return s}}function __(n){const e=W(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=f_.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=YP.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=GP.bind(null,e),e.hc.Tn=kP.bind(null,e.eventManager),e.hc.wc=DP.bind(null,e.eventManager),e}function y_(n){const e=W(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=HP.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=KP.bind(null,e),e}class Vi{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Da(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Dc(e),await this.persistence.start(),this.localStore=this.xc(e),this.gcScheduler=this.Cc(e,this.localStore),this.indexBackfillerScheduler=this.Fc(e,this.localStore)}Cc(e,t){return null}Fc(e,t){return null}xc(e){return e_(this.persistence,new Zg,e.initialUser,this.serializer)}Dc(e){return new Al(Xa.b_,this.serializer)}vc(e){return new c_}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Vi.provider={build:()=>new Vi};class XP extends Vi{constructor(e){super(),this.cacheSizeBytes=e}Cc(e,t){L(this.persistence.referenceDelegate instanceof ma,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new og(r,e.asyncQueue,t)}Dc(e){const t=this.cacheSizeBytes!==void 0?Me.withCacheSize(this.cacheSizeBytes):Me.DEFAULT;return new Al((r=>ma.b_(r,t)),this.serializer)}}class JP extends Vi{constructor(e,t,r){super(),this.Oc=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Oc.initialize(this,e),await y_(this.Oc.syncEngine),await Xi(this.Oc.remoteStore),await this.persistence.eo((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}xc(e){return e_(this.persistence,new Zg,e.initialUser,this.serializer)}Cc(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new og(r,e.asyncQueue,t)}Fc(e,t){const r=new VP(t,this.persistence);return new SP(e.asyncQueue,r)}Dc(e){const t=sP(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?Me.withCacheSize(this.cacheSizeBytes):Me.DEFAULT;return new Rl(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,CP(),zo(),this.serializer,this.sharedClientState,!!this.forceOwnership)}vc(e){return new c_}}class _a{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Uf(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=QP.bind(null,this.syncEngine),await bP(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new NP})()}createDatastore(e){const t=Da(e.databaseInfo.databaseId),r=lv(e.databaseInfo);return mv(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,i,o,u){return new gP(r,s,i,o,u)})(this.localStore,this.datastore,e.asyncQueue,(t=>Uf(this.syncEngine,t,0)),(function(){return ef.Ye()?new ef:new ov})())}createSyncEngine(e,t){return(function(s,i,o,u,c,l,f){const p=new UP(s,i,o,u,c,l);return f&&(p.gc=!0),p})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=W(s);k(kt,"RemoteStore shutting down."),i.la.add(5),await Yi(i),i.ha.shutdown(),i.Ta.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}_a.provider={build:()=>new _a};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nn="FirestoreClient";class ZP{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Ne.UNAUTHENTICATED,this.clientId=Mc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,(async o=>{k(Nn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(r,(o=>(k(Nn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new xt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Dl(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function Mu(n,e){n.asyncQueue.verifyOperationInProgress(),k(Nn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await t_(e.localStore,s),r=s)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function Bf(n,e){n.asyncQueue.verifyOperationInProgress();const t=await eb(n);k(Nn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>Df(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>Df(e.remoteStore,s))),n._onlineComponents=e}async function eb(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){k(Nn,"Using user provided OfflineComponentProvider");try{await Mu(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===C.FAILED_PRECONDITION||s.code===C.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;ft("Error using user provided cache. Falling back to memory cache: "+t),await Mu(n,new Vi)}}else k(Nn,"Using default OfflineComponentProvider"),await Mu(n,new XP(void 0));return n._offlineComponents}async function I_(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(k(Nn,"Using user provided OnlineComponentProvider"),await Bf(n,n._uninitializedComponentsProvider._online)):(k(Nn,"Using default OnlineComponentProvider"),await Bf(n,new _a))),n._onlineComponents}function tb(n){return I_(n).then((e=>e.syncEngine))}async function ya(n){const e=await I_(n),t=e.eventManager;return t.onListen=FP.bind(null,e.syncEngine),t.onUnlisten=$P.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=BP.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=jP.bind(null,e.syncEngine),t}function nb(n,e,t,r){const s=new Nl(r),i=new Ul(e,s,t);return n.asyncQueue.enqueueAndForget((async()=>Ol(await ya(n),i))),()=>{s.Va(),n.asyncQueue.enqueueAndForget((async()=>Ll(await ya(n),i)))}}function rb(n,e,t={}){const r=new xt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,u,c,l){const f=new Nl({next:g=>{f.Va(),o.enqueueAndForget((()=>Ll(i,p)));const A=g.docs.has(u);!A&&g.fromCache?l.reject(new O(C.UNAVAILABLE,"Failed to get document because the client is offline.")):A&&g.fromCache&&c&&c.source==="server"?l.reject(new O(C.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):l.resolve(g)},error:g=>l.reject(g)}),p=new Ul(Bi(u.path),f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Ol(i,p)})(await ya(n),n.asyncQueue,e,t,r))),r.promise}function sb(n,e,t={}){const r=new xt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,u,c,l){const f=new Nl({next:g=>{f.Va(),o.enqueueAndForget((()=>Ll(i,p))),g.fromCache&&c.source==="server"?l.reject(new O(C.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):l.resolve(g)},error:g=>l.reject(g)}),p=new Ul(u instanceof ni?sR(u):u,f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Ol(i,p)})(await ya(n),n.asyncQueue,e,t,r))),r.promise}function ib(n,e){const t=new xt;return n.asyncQueue.enqueueAndForget((async()=>zP(await tb(n),e,t))),t.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let T_=class{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new _e(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new ob(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(Ht("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},ob=class extends T_{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ab{convertValue(e,t="none"){switch(Ee(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ue(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Gt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw B(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Ln(e,((s,i)=>{r[s]=this.convertValue(i,t)})),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[_r].arrayValue)==null?void 0:s.values)==null?void 0:i.map((o=>ue(o.doubleValue)));return new Je(t)}convertGeoPoint(e){return new Ct(ue(e.latitude),ue(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ui(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Jr(e));default:return null}}convertTimestamp(e){const t=zt(e);return new se(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ee.fromString(e);L(Qm(r),9688,{name:e});const s=new gr(r.get(1),r.get(3)),i=new F(r.popFirst(5));return s.isEqual(t)||Ge(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ql(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qf="AsyncQueue";class $f{constructor(e=Promise.resolve()){this.$c=[],this.Kc=!1,this.Qc=[],this.Wc=null,this.Gc=!1,this.zc=!1,this.jc=[],this.Ht=new eg(this,"async_queue_retry"),this.Hc=()=>{const r=zo();r&&k(qf,"Visibility state changed to "+r.visibilityState),this.Ht.$t()},this.Jc=e;const t=zo();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Hc)}get isShuttingDown(){return this.Kc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Yc(),this.Zc(e)}enterRestrictedMode(e){if(!this.Kc){this.Kc=!0,this.zc=e||!1;const t=zo();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Hc)}}enqueue(e){if(this.Yc(),this.Kc)return new Promise((()=>{}));const t=new xt;return this.Zc((()=>this.Kc&&this.zc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.$c.push(e),this.Xc())))}async Xc(){if(this.$c.length!==0){try{await this.$c[0](),this.$c.shift(),this.Ht.reset()}catch(e){if(!Mn(e))throw e;k(qf,"Operation failed with retryable error: "+e)}this.$c.length>0&&this.Ht.kt((()=>this.Xc()))}}Zc(e){const t=this.Jc.then((()=>(this.Gc=!0,e().catch((r=>{throw this.Wc=r,this.Gc=!1,Ge("INTERNAL UNHANDLED ERROR: ",jf(r)),r})).then((r=>(this.Gc=!1,r))))));return this.Jc=t,t}enqueueAfterDelay(e,t,r){this.Yc(),this.jc.indexOf(e)>-1&&(t=0);const s=kl.createAndSchedule(this,e,t,r,(i=>this.el(i)));return this.Qc.push(s),s}Yc(){this.Wc&&B(47125,{tl:jf(this.Wc)})}verifyOperationInProgress(){}async nl(){let e;do e=this.Jc,await e;while(e!==this.Jc)}rl(e){for(const t of this.Qc)if(t.timerId===e)return!0;return!1}il(e){return this.nl().then((()=>{this.Qc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Qc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.nl()}))}sl(e){this.jc.push(e)}el(e){const t=this.Qc.indexOf(e);this.Qc.splice(t,1)}}function jf(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Dt extends Ma{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new $f,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new $f(e),this._firestoreClient=void 0,await e}}}function US(n,e){const t=typeof n=="object"?n:Pc(),r=typeof n=="string"?n:ea,s=Ea(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=op("firestore");i&&vv(s,...i)}return s}function Zi(n){if(n._terminated)throw new O(C.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||E_(n),n._firestoreClient}function E_(n){var r,s,i,o;const e=n._freezeSettings(),t=_v(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(s=n._app)==null?void 0:s.options.apiKey,e);n._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new ZP(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(c){const l=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(l),_online:l}})(n._componentsProvider))}function FS(n,e){ft("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=n._freezeSettings();return ub(n,_a.provider,{build:r=>new JP(r,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}function ub(n,e,t){if((n=Xe(n,Dt))._firestoreClient||n._terminated)throw new O(C.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(n._componentsProvider||n._getSettings().localCache)throw new O(C.FAILED_PRECONDITION,"SDK cache is already specified.");n._componentsProvider={_online:e,_offline:t},E_(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $l extends ab{constructor(e){super(),this.firestore=e}convertBytes(e){return new ct(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new _e(this.firestore,null,t)}}class Ws{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class ur extends T_{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Go(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Ht("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new O(C.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=ur._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}ur._jsonSchemaVersion="firestore/documentSnapshot/1.0",ur._jsonSchema={type:Te("string",ur._jsonSchemaVersion),bundleSource:Te("string","DocumentSnapshot"),bundleName:Te("string"),bundle:Te("string")};class Go extends ur{data(e={}){return super.data(e)}}class cr{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Ws(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new Go(this._firestore,this._userDataWriter,r.key,r,new Ws(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(C.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((u=>{Ie(s._snapshot.query)?_c(s._snapshot.query):Kc(s.query._query);const c=new Go(s._firestore,s._userDataWriter,u.doc.key,u.doc,new Ws(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((u=>i||u.type!==3)).map((u=>{const c=new Go(s._firestore,s._userDataWriter,u.doc.key,u.doc,new Ws(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let l=-1,f=-1;return u.type!==0&&(l=o.indexOf(u.doc.key),o=o.delete(u.doc.key)),u.type!==1&&(o=o.add(u.doc),f=o.indexOf(u.doc.key)),{type:cb(u.type),doc:c,oldIndex:l,newIndex:f}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new O(C.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=cr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Mc.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function cb(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return B(61501,{type:n})}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */cr._jsonSchemaVersion="firestore/querySnapshot/1.0",cr._jsonSchema={type:Te("string",cr._jsonSchemaVersion),bundleSource:Te("string","QuerySnapshot"),bundleName:Te("string"),bundle:Te("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function w_(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new O(C.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class jl{}class zl extends jl{}function BS(n,e,...t){let r=[];e instanceof jl&&r.push(e),r=r.concat(t),(function(i){const o=i.filter((c=>c instanceof Gl)).length,u=i.filter((c=>c instanceof Za)).length;if(o>1||o>0&&u>0)throw new O(C.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const s of r)n=s._apply(n);return n}class Za extends zl{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Za(e,t,r)}_apply(e){const t=this._parse(e);return v_(e._query,t),new Xt(e.firestore,e.converter,nc(e._query,t))}_parse(e){const t=Ua(e.firestore);return(function(i,o,u,c,l,f,p){let g;if(l.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new O(C.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Gf(p,f);const S=[];for(const D of p)S.push(zf(c,i,D));g={arrayValue:{values:S}}}else g=zf(c,i,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Gf(p,f),g=Cv(u,o,p,f==="in"||f==="not-in");return ne.create(l,f,g)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function qS(n,e,t){const r=e,s=Ht("where",n);return Za._create(s,r,t)}class Gl extends jl{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Gl(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:oe.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let o=s;const u=i.getFlattenedFilters();for(const c of u)v_(o,c),o=nc(o,c)})(e._query,t),new Xt(e.firestore,e.converter,nc(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Hl extends zl{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Hl(e,t)}_apply(e){const t=(function(s,i,o){if(s.startAt!==null)throw new O(C.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new O(C.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new gi(i,o)})(e._query,this._field,this._direction);return new Xt(e.firestore,e.converter,Sw(e._query,t))}}function $S(n,e="asc"){const t=e,r=Ht("orderBy",n);return Hl._create(r,t)}class Kl extends zl{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Kl(e,t,r)}_apply(e){return new Xt(e.firestore,e.converter,ia(e._query,this._limit,this._limitType))}}function jS(n){return Kl._create("limit",n,"F")}function zf(n,e,t){if(typeof(t=de(t))=="string"){if(t==="")throw new O(C.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!xm(e)&&t.indexOf("/")!==-1)throw new O(C.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(ee.fromString(t));if(!F.isDocumentKey(r))throw new O(C.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return fi(n,new F(r))}if(t instanceof _e)return fi(n,t._key);throw new O(C.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Pa(t)}.`)}function Gf(n,e){if(!Array.isArray(n)||n.length===0)throw new O(C.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function v_(n,e){const t=(function(s,i){for(const o of s)for(const u of o.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null})(n.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new O(C.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new O(C.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hf(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lb{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Ua(e)}set(e,t,r){this._verifyNotCommitted();const s=Uu(e,this._firestore),i=ql(s.converter,t,r),o=Zc(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,Ce.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=Uu(e,this._firestore);let o;return o=typeof(t=de(t))=="string"||t instanceof Oa?Vv(this._dataReader,"WriteBatch.update",i._key,t,r,s):Sv(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,Ce.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=Uu(e,this._firestore);return this._mutations=this._mutations.concat(new Fi(t._key,Ce.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new O(C.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Uu(n,e){if((n=de(n)).firestore!==e)throw new O(C.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zS(n){n=Xe(n,_e);const e=Xe(n.firestore,Dt),t=Zi(e);return rb(t,n._key).then((r=>A_(e,n,r)))}function GS(n){n=Xe(n,Xt);const e=Xe(n.firestore,Dt),t=Zi(e),r=new $l(e);return w_(n._query),sb(t,n._query).then((s=>new cr(e,r,n,s)))}function HS(n,e,t){n=Xe(n,_e);const r=Xe(n.firestore,Dt),s=ql(n.converter,e,t),i=Ua(r);return eu(r,[Zc(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,Ce.none())])}function KS(n){return eu(Xe(n.firestore,Dt),[new Fi(n._key,Ce.none())])}function WS(n,e){const t=Xe(n.firestore,Dt),r=Av(n),s=ql(n.converter,e),i=Ua(n.firestore);return eu(t,[Zc(i,"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,Ce.exists(!1))]).then((()=>r))}function QS(n,...e){var l,f,p;n=de(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||Hf(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Hf(e[r])){const g=e[r];e[r]=(l=g.next)==null?void 0:l.bind(g),e[r+1]=(f=g.error)==null?void 0:f.bind(g),e[r+2]=(p=g.complete)==null?void 0:p.bind(g)}let i,o,u;if(n instanceof _e)o=Xe(n.firestore,Dt),u=Bi(n._key.path),i={next:g=>{e[r]&&e[r](A_(o,n,g))},error:e[r+1],complete:e[r+2]};else{const g=Xe(n,Xt);o=Xe(g.firestore,Dt),u=g._query;const A=new $l(o);i={next:S=>{e[r]&&e[r](new cr(o,A,g,S))},error:e[r+1],complete:e[r+2]},w_(n._query)}const c=Zi(o);return nb(c,u,s,i)}function eu(n,e){const t=Zi(n);return ib(t,e)}function A_(n,e,t){const r=t.docs.get(e._key),s=new $l(n);return new ur(n,s,e._key,r,new Ws(t.hasPendingWrites,t.fromCache),e.converter)}function YS(n){return n=Xe(n,Dt),Zi(n),new lb(n,(e=>eu(n,e)))}const Kf="@firebase/firestore",Wf="4.17.2";(function(e,t=!0){YE(Ar),dr(new An("firestore",((r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),u=new Dt(new nv(r.getProvider("auth-internal")),new iv(o,r.getProvider("app-check-internal")),iw(o,s),o);return i={useFetchStreams:t,...i},u._setSettings(i),u}),"PUBLIC").setMultipleInstances(!0)),bt(Kf,Wf,e),bt(Kf,Wf,"esm2020")})();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R_="firebasestorage.googleapis.com",P_="storageBucket",hb=120*1e3,db=600*1e3,fb=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pe extends Ot{constructor(e,t,r=0){super(Fu(e),`Firebase Storage: ${t} (${Fu(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,pe.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Fu(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var he;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(he||(he={}));function Fu(n){return"storage/"+n}function Wl(){const n="An unknown error occurred, please check the error payload for server response.";return new pe(he.UNKNOWN,n)}function pb(n){return new pe(he.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function mb(n){return new pe(he.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function gb(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new pe(he.UNAUTHENTICATED,n)}function _b(){return new pe(he.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function yb(n){return new pe(he.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function b_(){return new pe(he.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function S_(){return new pe(he.CANCELED,"User canceled the upload/download.")}function Ib(n){return new pe(he.INVALID_URL,"Invalid URL '"+n+"'.")}function Tb(n){return new pe(he.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Eb(){return new pe(he.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+P_+"' property when initializing the app?")}function V_(){return new pe(he.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function wb(){return new pe(he.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function vb(){return new pe(he.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Ab(n){return new pe(he.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function wc(n){return new pe(he.INVALID_ARGUMENT,n)}function C_(){return new pe(he.APP_DELETED,"The Firebase app was deleted.")}function Rb(n){return new pe(he.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function ai(n,e){return new pe(he.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function qs(n){throw new pe(he.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=it.makeFromUrl(e,t)}catch{return new it(e,"")}if(r.path==="")return r;throw Tb(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(Q){Q.path.charAt(Q.path.length-1)==="/"&&(Q.path_=Q.path_.slice(0,-1))}const o="(/(.*))?$",u=new RegExp("^gs://"+s+o,"i"),c={bucket:1,path:3};function l(Q){Q.path_=decodeURIComponent(Q.path)}const f="v[A-Za-z0-9_]+",p=t.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",A=new RegExp(`^https?://${p}/${f}/b/${s}/o${g}`,"i"),S={bucket:1,path:3},D=t===R_?"(?:storage.googleapis.com|storage.cloud.google.com)":t,N="([^?#]*)",$=new RegExp(`^https?://${D}/${s}/${N}`,"i"),q=[{regex:u,indices:c,postModify:i},{regex:A,indices:S,postModify:l},{regex:$,indices:{bucket:1,path:2},postModify:l}];for(let Q=0;Q<q.length;Q++){const X=q[Q],Z=X.regex.exec(e);if(Z){const T=Z[X.indices.bucket];let _=Z[X.indices.path];_||(_=""),r=new it(T,_),X.postModify(r);break}}if(r==null)throw Ib(e);return r}}class Pb{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bb(n,e,t){let r=1,s=null,i=null,o=!1,u=0;function c(){return u===2}let l=!1;function f(...N){l||(l=!0,e.apply(null,N))}function p(N){s=setTimeout(()=>{s=null,n(A,c())},N)}function g(){i&&clearTimeout(i)}function A(N,...$){if(l){g();return}if(N){g(),f.call(null,N,...$);return}if(c()||o){g(),f.call(null,N,...$);return}r<64&&(r*=2);let q;u===1?(u=2,q=0):q=(r+Math.random())*1e3,p(q)}let S=!1;function D(N){S||(S=!0,g(),!l&&(s!==null?(N||(u=2),clearTimeout(s),p(0)):N||(u=1)))}return p(0),i=setTimeout(()=>{o=!0,D(!0)},t),D}function Sb(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vb(n){return n!==void 0}function Cb(n){return typeof n=="function"}function xb(n){return typeof n=="object"&&!Array.isArray(n)}function tu(n){return typeof n=="string"||n instanceof String}function Qf(n){return Ql()&&n instanceof Blob}function Ql(){return typeof Blob<"u"}function Yf(n,e,t,r){if(r<e)throw wc(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw wc(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ys(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function x_(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var lr;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(lr||(lr={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function N_(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||s||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nb{constructor(e,t,r,s,i,o,u,c,l,f,p,g=!0,A=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=u,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=f,this.connectionFactory_=p,this.retry=g,this.isUsingEmulator=A,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((S,D)=>{this.resolve_=S,this.reject_=D,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new bo(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=u=>{const c=u.loaded,l=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const u=i.getErrorCode()===lr.NO_ERROR,c=i.getStatus();if(!u||N_(c,this.additionalRetryCodes_)&&this.retry){const f=i.getErrorCode()===lr.ABORT;r(!1,new bo(!1,null,f));return}const l=this.successCodes_.indexOf(c)!==-1;r(!0,new bo(l,i))})},t=(r,s)=>{const i=this.resolve_,o=this.reject_,u=s.connection;if(s.wasSuccessCode)try{const c=this.callback_(u,u.getResponse());Vb(c)?i(c):i()}catch(c){o(c)}else if(u!==null){const c=Wl();c.serverResponse=u.getErrorText(),this.errorCallback_?o(this.errorCallback_(u,c)):o(c)}else if(s.canceled){const c=this.appDelete_?C_():S_();o(c)}else{const c=b_();o(c)}};this.canceled_?t(!1,new bo(!1,null,!0)):this.backoffId_=bb(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&Sb(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class bo{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function kb(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function Db(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function Ob(n,e){e&&(n["X-Firebase-GMPID"]=e)}function Lb(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function Mb(n,e,t,r,s,i,o=!0,u=!1){const c=x_(n.urlParams),l=n.url+c,f=Object.assign({},n.headers);return Ob(f,e),kb(f,t),Db(f,i),Lb(f,r),new Nb(l,n.method,f,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,o,u)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ub(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Fb(...n){const e=Ub();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(Ql())return new Blob(n);throw new pe(he.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Bb(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qb(n){if(typeof atob>"u")throw Ab("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pt={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Bu{constructor(e,t){this.data=e,this.contentType=t||null}}function $b(n,e){switch(n){case Pt.RAW:return new Bu(k_(e));case Pt.BASE64:case Pt.BASE64URL:return new Bu(D_(n,e));case Pt.DATA_URL:return new Bu(zb(e),Gb(e))}throw Wl()}function k_(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const i=r,o=n.charCodeAt(++t);r=65536|(i&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function jb(n){let e;try{e=decodeURIComponent(n)}catch{throw ai(Pt.DATA_URL,"Malformed data URL.")}return k_(e)}function D_(n,e){switch(n){case Pt.BASE64:{const s=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(s||i)throw ai(n,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case Pt.BASE64URL:{const s=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(s||i)throw ai(n,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=qb(e)}catch(s){throw s.message.includes("polyfill")?s:ai(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}class O_{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw ai(Pt.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=Hb(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function zb(n){const e=new O_(n);return e.base64?D_(Pt.BASE64,e.rest):jb(e.rest)}function Gb(n){return new O_(n).contentType}function Hb(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _n{constructor(e,t){let r=0,s="";Qf(e)?(this.data_=e,r=e.size,s=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,t){if(Qf(this.data_)){const r=this.data_,s=Bb(r,e,t);return s===null?null:new _n(s)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new _n(r,!0)}}static getBlob(...e){if(Ql()){const t=e.map(r=>r instanceof _n?r.data_:r);return new _n(Fb.apply(null,t))}else{const t=e.map(o=>tu(o)?$b(Pt.RAW,o).data:o.data_);let r=0;t.forEach(o=>{r+=o.byteLength});const s=new Uint8Array(r);let i=0;return t.forEach(o=>{for(let u=0;u<o.length;u++)s[i++]=o[u]}),new _n(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L_(n){let e;try{e=JSON.parse(n)}catch{return null}return xb(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kb(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function Wb(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function M_(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qb(n,e){return e}class ze{constructor(e,t,r,s){this.server=e,this.local=t||e,this.writable=!!r,this.xform=s||Qb}}let So=null;function Yb(n){return!tu(n)||n.length<2?n:M_(n)}function U_(){if(So)return So;const n=[];n.push(new ze("bucket")),n.push(new ze("generation")),n.push(new ze("metageneration")),n.push(new ze("name","fullPath",!0));function e(i,o){return Yb(o)}const t=new ze("name");t.xform=e,n.push(t);function r(i,o){return o!==void 0?Number(o):o}const s=new ze("size");return s.xform=r,n.push(s),n.push(new ze("timeCreated")),n.push(new ze("updated")),n.push(new ze("md5Hash",null,!0)),n.push(new ze("cacheControl",null,!0)),n.push(new ze("contentDisposition",null,!0)),n.push(new ze("contentEncoding",null,!0)),n.push(new ze("contentLanguage",null,!0)),n.push(new ze("contentType",null,!0)),n.push(new ze("metadata","customMetadata",!0)),So=n,So}function Xb(n,e){function t(){const r=n.bucket,s=n.fullPath,i=new it(r,s);return e._makeStorageReference(i)}Object.defineProperty(n,"ref",{get:t})}function Jb(n,e,t){const r={};r.type="file";const s=t.length;for(let i=0;i<s;i++){const o=t[i];r[o.local]=o.xform(r,e[o.server])}return Xb(r,n),r}function F_(n,e,t){const r=L_(e);return r===null?null:Jb(n,r,t)}function Zb(n,e,t,r){const s=L_(e);if(s===null||!tu(s.downloadTokens))return null;const i=s.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(l=>{const f=n.bucket,p=n.fullPath,g="/b/"+o(f)+"/o/"+o(p),A=ys(g,t,r),S=x_({alt:"media",token:l});return A+S})[0]}function B_(n,e){const t={},r=e.length;for(let s=0;s<r;s++){const i=e[s];i.writable&&(t[i.server]=n[i.local])}return JSON.stringify(t)}class Cr{constructor(e,t,r,s){this.url=e,this.method=t,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qt(n){if(!n)throw Wl()}function Yl(n,e){function t(r,s){const i=F_(n,s,e);return qt(i!==null),i}return t}function eS(n,e){function t(r,s){const i=F_(n,s,e);return qt(i!==null),Zb(i,s,n.host,n._protocol)}return t}function eo(n){function e(t,r){let s;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?s=_b():s=gb():t.getStatus()===402?s=mb(n.bucket):t.getStatus()===403?s=yb(n.path):s=r,s.status=t.getStatus(),s.serverResponse=r.serverResponse,s}return e}function Xl(n){const e=eo(n);function t(r,s){let i=e(r,s);return r.getStatus()===404&&(i=pb(n.path)),i.serverResponse=s.serverResponse,i}return t}function tS(n,e,t){const r=e.fullServerUrl(),s=ys(r,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,u=new Cr(s,i,Yl(n,t),o);return u.errorHandler=Xl(e),u}function nS(n,e,t){const r=e.fullServerUrl(),s=ys(r,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,u=new Cr(s,i,eS(n,t),o);return u.errorHandler=Xl(e),u}function rS(n,e){const t=e.fullServerUrl(),r=ys(t,n.host,n._protocol),s="DELETE",i=n.maxOperationRetryTime;function o(c,l){}const u=new Cr(r,s,o,i);return u.successCodes=[200,204],u.errorHandler=Xl(e),u}function sS(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function q_(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=sS(null,e)),r}function iS(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function u(){let q="";for(let Q=0;Q<2;Q++)q=q+Math.random().toString().slice(2);return q}const c=u();o["Content-Type"]="multipart/related; boundary="+c;const l=q_(e,r,s),f=B_(l,t),p="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,g=`\r
--`+c+"--",A=_n.getBlob(p,r,g);if(A===null)throw V_();const S={name:l.fullPath},D=ys(i,n.host,n._protocol),N="POST",$=n.maxUploadRetryTime,j=new Cr(D,N,Yl(n,t),$);return j.urlParams=S,j.headers=o,j.body=A.uploadData(),j.errorHandler=eo(e),j}class Ia{constructor(e,t,r,s){this.current=e,this.total=t,this.finalized=!!r,this.metadata=s||null}}function Jl(n,e){let t=null;try{t=n.getResponseHeader("X-Goog-Upload-Status")}catch{qt(!1)}return qt(!!t&&(e||["active"]).indexOf(t)!==-1),t}function oS(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),o=q_(e,r,s),u={name:o.fullPath},c=ys(i,n.host,n._protocol),l="POST",f={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${r.size()}`,"X-Goog-Upload-Header-Content-Type":o.contentType,"Content-Type":"application/json; charset=utf-8"},p=B_(o,t),g=n.maxUploadRetryTime;function A(D){Jl(D);let N;try{N=D.getResponseHeader("X-Goog-Upload-URL")}catch{qt(!1)}return qt(tu(N)),N}const S=new Cr(c,l,A,g);return S.urlParams=u,S.headers=f,S.body=p,S.errorHandler=eo(e),S}function aS(n,e,t,r){const s={"X-Goog-Upload-Command":"query"};function i(l){const f=Jl(l,["active","final"]);let p=null;try{p=l.getResponseHeader("X-Goog-Upload-Size-Received")}catch{qt(!1)}p||qt(!1);const g=Number(p);return qt(!isNaN(g)),new Ia(g,r.size(),f==="final")}const o="POST",u=n.maxUploadRetryTime,c=new Cr(t,o,i,u);return c.headers=s,c.errorHandler=eo(e),c}const Xf=256*1024;function uS(n,e,t,r,s,i,o,u){const c=new Ia(0,0);if(o?(c.current=o.current,c.total=o.total):(c.current=0,c.total=r.size()),r.size()!==c.total)throw wb();const l=c.total-c.current;let f=l;s>0&&(f=Math.min(f,s));const p=c.current,g=p+f;let A="";f===0?A="finalize":l===f?A="upload, finalize":A="upload";const S={"X-Goog-Upload-Command":A,"X-Goog-Upload-Offset":`${c.current}`},D=r.slice(p,g);if(D===null)throw V_();function N(Q,X){const Z=Jl(Q,["active","final"]),T=c.current+f,_=r.size();let I;return Z==="final"?I=Yl(e,i)(Q,X):I=null,new Ia(T,_,Z==="final",I)}const $="POST",j=e.maxUploadRetryTime,q=new Cr(t,$,N,j);return q.headers=S,q.body=D.uploadData(),q.progressCallback=u||null,q.errorHandler=eo(n),q}const We={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function qu(n){switch(n){case"running":case"pausing":case"canceling":return We.RUNNING;case"paused":return We.PAUSED;case"success":return We.SUCCESS;case"canceled":return We.CANCELED;case"error":return We.ERROR;default:return We.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cS{constructor(e,t,r){if(Cb(e)||t!=null||r!=null)this.next=e,this.error=t??void 0,this.complete=r??void 0;else{const i=e;this.next=i.next,this.error=i.error,this.complete=i.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n){return(...e)=>{Promise.resolve().then(()=>n(...e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lS{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=lr.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=lr.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=lr.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,s,i){if(this.sent_)throw qs("cannot .send() more than once");if(vr(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),i!==void 0)for(const o in i)i.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,i[o].toString());return s!==void 0?this.xhr_.send(s):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw qs("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw qs("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw qs("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw qs("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class hS extends lS{initXhr(){this.xhr_.responseType="text"}}function Xn(){return new hS}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dS{isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}constructor(e,t,r=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=t,this._metadata=r,this._mappings=U_(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=s=>{if(this._request=void 0,this._chunkMultiplier=1,s._codeEquals(he.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const i=this.isExponentialBackoffExpired();if(N_(s.status,[]))if(i)s=b_();else{this.sleepTime=Math.max(this.sleepTime*2,fb),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=s,this._transition("error")}},this._metadataErrorHandler=s=>{this._request=void 0,s._codeEquals(he.CANCELED)?this.completeTransitions_():(this._error=s,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((s,i)=>{this._resolve=s,this._reject=i,this._start()}),this._promise.then(null,()=>{})}_makeProgressCallback(){const e=this._transferred;return t=>this._updateProgress(e+t)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([t,r])=>{switch(this._state){case"running":e(t,r);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,t)=>{const r=oS(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,Xn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._uploadUrl=i,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((t,r)=>{const s=aS(this._ref.storage,this._ref._location,e,this._blob),i=this._ref.storage._makeRequest(s,Xn,t,r);this._request=i,i.getPromise().then(o=>{o=o,this._request=void 0,this._updateProgress(o.current),this._needToFetchStatus=!1,o.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=Xf*this._chunkMultiplier,t=new Ia(this._transferred,this._blob.size()),r=this._uploadUrl;this._resolveToken((s,i)=>{let o;try{o=uS(this._ref._location,this._ref.storage,r,this._blob,e,this._mappings,t,this._makeProgressCallback())}catch(c){this._error=c,this._transition("error");return}const u=this._ref.storage._makeRequest(o,Xn,s,i,!1);this._request=u,u.getPromise().then(c=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(c.current),c.finalized?(this._metadata=c.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){Xf*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,t)=>{const r=tS(this._ref.storage,this._ref._location,this._mappings),s=this._ref.storage._makeRequest(r,Xn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,t)=>{const r=iS(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,Xn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const t=this._transferred;this._transferred=e,this._transferred!==t&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const t=this._state==="paused";this._state=e,t&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=S_(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=qu(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,t,r,s){const i=new cS(t||void 0,r||void 0,s||void 0);return this._addObserver(i),()=>{this._removeObserver(i)}}then(e,t){return this._promise.then(e,t)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const t=this._observers.indexOf(e);t!==-1&&this._observers.splice(t,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(t=>{this._notifyObserver(t)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(qu(this._state)){case We.SUCCESS:qr(this._resolve.bind(null,this.snapshot))();break;case We.CANCELED:case We.ERROR:const t=this._reject;qr(t.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(qu(this._state)){case We.RUNNING:case We.PAUSED:e.next&&qr(e.next.bind(e,this.snapshot))();break;case We.SUCCESS:e.complete&&qr(e.complete.bind(e))();break;case We.CANCELED:case We.ERROR:e.error&&qr(e.error.bind(e,this._error))();break;default:e.error&&qr(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wr{constructor(e,t){this._service=e,t instanceof it?this._location=t:this._location=it.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new wr(e,t)}get root(){const e=new it(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return M_(this._location.path)}get storage(){return this._service}get parent(){const e=Kb(this._location.path);if(e===null)return null;const t=new it(this._location.bucket,e);return new wr(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw Rb(e)}}function fS(n,e,t){return n._throwIfRoot("uploadBytesResumable"),new dS(n,new _n(e),t)}function pS(n){n._throwIfRoot("getDownloadURL");const e=nS(n.storage,n._location,U_());return n.storage.makeRequestWithTokens(e,Xn).then(t=>{if(t===null)throw vb();return t})}function mS(n){n._throwIfRoot("deleteObject");const e=rS(n.storage,n._location);return n.storage.makeRequestWithTokens(e,Xn)}function gS(n,e){const t=Wb(n._location.path,e),r=new it(n._location.bucket,t);return new wr(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _S(n){return/^[A-Za-z]+:\/\//.test(n)}function yS(n,e){return new wr(n,e)}function $_(n,e){if(n instanceof Zl){const t=n;if(t._bucket==null)throw Eb();const r=new wr(t,t._bucket);return e!=null?$_(r,e):r}else return e!==void 0?gS(n,e):n}function IS(n,e){if(e&&_S(e)){if(n instanceof Zl)return yS(n,e);throw wc("To use ref(service, url), the first argument must be a Storage instance.")}else return $_(n,e)}function Jf(n,e){const t=e==null?void 0:e[P_];return t==null?null:it.makeFromBucketSpec(t,n)}function TS(n,e,t,r={}){n.host=`${e}:${t}`;const s=vr(e);s&&Ac(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=s?"https":"http";const{mockUserToken:i}=r;i&&(n._overrideAuthToken=typeof i=="string"?i:lp(i,n.app.options.projectId))}class Zl{constructor(e,t,r,s,i,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=R_,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=hb,this._maxUploadRetryTime=db,this._requests=new Set,s!=null?this._bucket=it.makeFromBucketSpec(s,this._host):this._bucket=Jf(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=it.makeFromBucketSpec(this._url,e):this._bucket=Jf(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){Yf("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){Yf("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(Qe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new wr(this,e)}_makeRequest(e,t,r,s,i=!0){if(this._deleted)return new Pb(C_());{const o=Mb(e,this._appId,r,s,t,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const Zf="@firebase/storage",ep="0.14.5";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j_="storage";function XS(n,e,t){return n=de(n),fS(n,e,t)}function JS(n){return n=de(n),pS(n)}function ZS(n){return n=de(n),mS(n)}function eV(n,e){return n=de(n),IS(n,e)}function tV(n=Pc(),e){n=de(n);const r=Ea(n,j_).getImmediate({identifier:e}),s=op("storage");return s&&ES(r,...s),r}function ES(n,e,t,r={}){TS(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wS(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new Zl(t,r,s,e,Ar)}function vS(){dr(new An(j_,wS,"PUBLIC").setMultipleInstances(!0)),bt(Zf,ep,""),bt(Zf,ep,"esm2020")}vS();export{$S as A,jS as B,WS as C,dn as G,KS as a,RS as b,kS as c,Av as d,FS as e,zS as f,US as g,GS as h,VI as i,CS as j,ZS as k,JS as l,DS as m,OS as n,QS as o,tV as p,SS as q,eV as r,HS as s,bS as t,XS as u,VS as v,YS as w,PS as x,BS as y,qS as z};
