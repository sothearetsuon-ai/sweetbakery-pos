import{o as D_,R as su}from"./vendor-utils-g8O2Mb-j.js";const N_=()=>{};var Vh={};/**
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
 */const Sf=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},k_=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Vf={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,u=s+2<n.length,h=u?n[s+2]:0,f=i>>2,p=(i&3)<<4|c>>4;let g=(c&15)<<2|h>>6,P=h&63;u||(P=64,o||(g=64)),r.push(t[f],t[p],t[g],t[P])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Sf(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):k_(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const p=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||p==null)throw new O_;const g=i<<2|c>>4;if(r.push(g),h!==64){const P=c<<4&240|h>>2;if(r.push(P),p!==64){const V=h<<6&192|p;r.push(V)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class O_ extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const L_=function(n){const e=Sf(n);return Vf.encodeByteArray(e,!0)},xo=function(n){return L_(n).replace(/\./g,"")},Cf=function(n){try{return Vf.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function xf(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const M_=()=>xf().__FIREBASE_DEFAULTS__,U_=()=>{if(typeof process>"u"||typeof Vh>"u")return;const n=Vh.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},F_=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Cf(n[1]);return e&&JSON.parse(e)},oa=()=>{try{return N_()||M_()||U_()||F_()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Df=n=>{var e,t;return(t=(e=oa())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},B_=n=>{const e=Df(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Nf=()=>{var n;return(n=oa())==null?void 0:n.config},kf=n=>{var e;return(e=oa())==null?void 0:e[`_${n}`]};/**
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
 */class Of{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function q_(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[xo(JSON.stringify(t)),xo(JSON.stringify(o)),""].join(".")}/**
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
 */function we(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function $_(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(we())}function Lf(){var e;const n=(e=oa())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function j_(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function z_(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function G_(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function K_(){const n=we();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Mf(){return!Lf()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Uf(){return!Lf()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Ff(){try{return typeof indexedDB=="object"}catch{return!1}}function H_(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const W_="FirebaseError";class xt extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=W_,Object.setPrototypeOf(this,xt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,gi.prototype.create)}}class gi{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Q_(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new xt(s,c,r)}}function Q_(n,e){try{let t=0,r="";for(;t<n.length;){const s=n.indexOf("{$",t);if(s===-1){r+=n.substring(t);break}const i=n.indexOf("}",s+2);if(i===-1){r+=n.substring(t);break}const o=n.substring(s+2,i),c=e[o];r+=n.substring(t,s)+(c!=null?String(c):`<${o}?>`),t=i+1}return r}catch{return n}}function Y_(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function sr(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Ch(i)&&Ch(o)){if(!sr(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Ch(n){return n!==null&&typeof n=="object"}/**
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
 */function _i(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Vs(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function Cs(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function J_(n,e){const t=new X_(n,e);return t.subscribe.bind(t)}class X_{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Z_(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=lc),s.error===void 0&&(s.error=lc),s.complete===void 0&&(s.complete=lc);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Z_(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function lc(){}/**
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
 */function ve(n){return n&&n._delegate?n._delegate:n}/**
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
 */function yi(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Bf(n){return(await fetch(n,{credentials:"include"})).ok}class In{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Fn="[DEFAULT]";/**
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
 */class ey{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Of;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ny(e))try{this.getOrInitializeService({instanceIdentifier:Fn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Fn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Fn){return this.instances.has(e)}getOptions(e=Fn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&o.resolve(s)}return s}onInit(e,t){const r=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ty(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Fn){return this.component?this.component.multipleInstances?e:Fn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ty(n){return n===Fn?void 0:n}function ny(n){return n.instantiationMode==="EAGER"}/**
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
 */class ry{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new ey(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var te;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(te||(te={}));const sy={debug:te.DEBUG,verbose:te.VERBOSE,info:te.INFO,warn:te.WARN,error:te.ERROR,silent:te.SILENT},iy=te.INFO,oy={[te.DEBUG]:"log",[te.VERBOSE]:"log",[te.INFO]:"info",[te.WARN]:"warn",[te.ERROR]:"error"},ay=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=oy[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class iu{constructor(e){this.name=e,this._logLevel=iy,this._logHandler=ay,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in te))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?sy[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,te.DEBUG,...e),this._logHandler(this,te.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,te.VERBOSE,...e),this._logHandler(this,te.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,te.INFO,...e),this._logHandler(this,te.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,te.WARN,...e),this._logHandler(this,te.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,te.ERROR,...e),this._logHandler(this,te.ERROR,...e)}}/**
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
 */class cy{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(uy(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function uy(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ac="@firebase/app",xh="0.16.2";/**
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
 */const Ut=new iu("@firebase/app"),ly="@firebase/app-compat",hy="@firebase/analytics-compat",dy="@firebase/analytics",fy="@firebase/app-check-compat",py="@firebase/app-check",my="@firebase/auth",gy="@firebase/auth-compat",_y="@firebase/database",yy="@firebase/data-connect",Iy="@firebase/database-compat",Ey="@firebase/functions",Ty="@firebase/functions-compat",wy="@firebase/installations",vy="@firebase/installations-compat",Ay="@firebase/messaging",Ry="@firebase/messaging-compat",Py="@firebase/performance",by="@firebase/performance-compat",Sy="@firebase/remote-config",Vy="@firebase/remote-config-compat",Cy="@firebase/storage",xy="@firebase/storage-compat",Dy="@firebase/firestore",Ny="@firebase/ai",ky="@firebase/firestore-compat",Oy="firebase",Ly="12.19.0";/**
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
 */const Rc="[DEFAULT]",My={[Ac]:"fire-core",[ly]:"fire-core-compat",[dy]:"fire-analytics",[hy]:"fire-analytics-compat",[py]:"fire-app-check",[fy]:"fire-app-check-compat",[my]:"fire-auth",[gy]:"fire-auth-compat",[_y]:"fire-rtdb",[yy]:"fire-data-connect",[Iy]:"fire-rtdb-compat",[Ey]:"fire-fn",[Ty]:"fire-fn-compat",[wy]:"fire-iid",[vy]:"fire-iid-compat",[Ay]:"fire-fcm",[Ry]:"fire-fcm-compat",[Py]:"fire-perf",[by]:"fire-perf-compat",[Sy]:"fire-rc",[Vy]:"fire-rc-compat",[Cy]:"fire-gcs",[xy]:"fire-gcs-compat",[Dy]:"fire-fst",[ky]:"fire-fst-compat",[Ny]:"fire-vertex","fire-js":"fire-js",[Oy]:"fire-js-all"};/**
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
 */const Ws=new Map,Uy=new Map,Pc=new Map;function Dh(n,e){try{n.container.addComponent(e)}catch(t){Ut.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function ir(n){const e=n.name;if(Pc.has(e))return Ut.debug(`There were multiple attempts to register component ${e}.`),!1;Pc.set(e,n);for(const t of Ws.values())Dh(t,n);for(const t of Uy.values())Dh(t,n);return!0}function ou(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Ge(n){return n==null?!1:n.settings!==void 0}/**
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
 */const Fy={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Nt=new gi("app","Firebase",Fy);/**
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
 */class By{constructor(e,t,r){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new In("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Nt.create("app-deleted",{appName:this._name})}}/**
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
 */const mr=Ly;function qy(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r={name:Rc,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw Nt.create("bad-app-name",{appName:String(s)});if(t||(t=Nf()),!t)throw Nt.create("no-options");const i=Ws.get(s);if(i)if(sr(t,i.options)){if(sr(r,i.config))return i;throw Nt.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(r)})}else throw Nt.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const o=new ry(s);for(const u of Pc.values())o.addComponent(u);const c=new By(t,r,o);return Ws.set(s,c),c}function qf(n=Rc){const e=Ws.get(n);if(!e&&n===Rc&&Nf())return qy();if(!e)throw Nt.create("no-app",{appName:n});return e}function JP(){return Array.from(Ws.values())}function wt(n,e,t){let r=My[n]??n;t&&(r+=`-${t}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${r}" with version "${e}":`];s&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ut.warn(o.join(" "));return}ir(new In(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
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
 */const $y="firebase-heartbeat-database",jy=1,Qs="firebase-heartbeat-store";let hc=null;function $f(){return hc||(hc=D_($y,jy,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Qs)}catch(t){console.warn(t)}}}}).catch(n=>{throw Nt.create("idb-open",{originalErrorMessage:n.message})})),hc}async function zy(n){try{const t=(await $f()).transaction(Qs),r=await t.objectStore(Qs).get(jf(n));return await t.done,r}catch(e){if(e instanceof xt)Ut.warn(e.message);else{const t=Nt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ut.warn(t.message)}}}async function Nh(n,e){try{const r=(await $f()).transaction(Qs,"readwrite");await r.objectStore(Qs).put(e,jf(n)),await r.done}catch(t){if(t instanceof xt)Ut.warn(t.message);else{const r=Nt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Ut.warn(r.message)}}}function jf(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Gy=1024,Ky=30;class Hy{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Qy(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=kh();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>Ky){const o=Yy(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Ut.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=kh(),{heartbeatsToSend:r,unsentEntries:s}=Wy(this._heartbeatsCache.heartbeats),i=xo(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Ut.warn(t),""}}}function kh(){return new Date().toISOString().substring(0,10)}function Wy(n,e=Gy){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Oh(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Oh(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class Qy{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ff()?H_().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await zy(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Nh(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Nh(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Oh(n){return xo(JSON.stringify({version:2,heartbeats:n})).length}function Yy(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
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
 */function Jy(n){ir(new In("platform-logger",e=>new cy(e),"PRIVATE")),ir(new In("heartbeat",e=>new Hy(e),"PRIVATE")),wt(Ac,xh,n),wt(Ac,xh,"esm2020"),wt("fire-js","")}/**
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
 */Jy("");var Xy="firebase",Zy="12.19.0";/**
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
 */wt(Xy,Zy,"app");function zf(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const eI=zf,Gf=new gi("auth","Firebase",zf());/**
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
 */const Do=new iu("@firebase/auth");function po(n,...e){Do.logLevel<=te.WARN&&Do.warn(`Auth (${mr}): ${n}`,...e)}function mo(n,...e){Do.logLevel<=te.ERROR&&Do.error(`Auth (${mr}): ${n}`,...e)}/**
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
 */function at(n,...e){throw au(n,...e)}function ft(n,...e){return au(n,...e)}function aa(n,e,t){const r={...eI(),[e]:t};return new gi("auth","Firebase",r).create(e,{appName:n.name})}function Lt(n){return aa(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function tI(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&at(n,"argument-error"),aa(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function au(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Gf.create(n,...e)}function G(n,e,...t){if(!n)throw au(e,...t)}function kt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw mo(e),new Error(e)}function Ft(n,e){n||kt(e)}/**
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
 */function bc(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function nI(){return Lh()==="http:"||Lh()==="https:"}function Lh(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
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
 */function rI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(nI()||z_()||"connection"in navigator)?navigator.onLine:!0}function sI(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class Ii{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ft(t>e,"Short delay should be less than long delay!"),this.isMobile=$_()||G_()}get(){return rI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function cu(n,e){Ft(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class Kf{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;kt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;kt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;kt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const iI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const oI=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],aI=new Ii(3e4,6e4);function Sn(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function Vn(n,e,t,r,s={}){return Hf(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const c=_i({...o,key:n.config.apiKey}).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const h={method:e,headers:u,...i};return j_()||(h.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&yi(n.emulatorConfig.host)&&(h.credentials="include"),Kf.fetch()(await Wf(n,n.config.apiHost,t,c),h)})}async function Hf(n,e,t){n._canInitEmulator=!1;const r={...iI,...e};try{const s=new uI(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw no(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[u,h]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw no(n,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw no(n,"email-already-in-use",o);if(u==="USER_DISABLED")throw no(n,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw aa(n,f,h);at(n,f)}}catch(s){if(s instanceof xt)throw s;at(n,"network-request-failed",{message:String(s)})}}async function Ei(n,e,t,r,s={}){const i=await Vn(n,e,t,r,s);return"mfaPendingCredential"in i&&at(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function Wf(n,e,t,r){const s=`${e}${t}?${r}`,i=n,o=i.config.emulator?cu(n.config,s):`${n.config.apiScheme}://${s}`;return oI.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function cI(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class uI{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(ft(this.auth,"network-request-failed")),aI.get())})}}function no(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=ft(n,e,r);return s.customData._tokenResponse=t,s}function Mh(n){return n!==void 0&&n.enterprise!==void 0}class lI{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return cI(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function hI(n,e){return Vn(n,"GET","/v2/recaptchaConfig",Sn(n,e))}/**
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
 */async function dI(n,e){return Vn(n,"POST","/v1/accounts:delete",e)}async function No(n,e){return Vn(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Ls(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function fI(n,e=!1){const t=ve(n),r=await t.getIdToken(e),s=uu(r);G(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Ls(dc(s.auth_time)),issuedAtTime:Ls(dc(s.iat)),expirationTime:Ls(dc(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function dc(n){return Number(n)*1e3}function uu(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return mo("JWT malformed, contained fewer than 3 sections"),null;try{const s=Cf(t);return s?JSON.parse(s):(mo("Failed to decode base64 JWT payload"),null)}catch(s){return mo("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Uh(n){const e=uu(n);return G(e,"internal-error"),G(typeof e.exp<"u","internal-error"),G(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function Ys(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof xt&&pI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function pI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class mI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Sc{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ls(this.lastLoginAt),this.creationTime=Ls(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function ko(n){var p;const e=n.auth,t=await n.getIdToken(),r=await Ys(n,No(e,{idToken:t}));G(r==null?void 0:r.users.length,e,"internal-error");const s=r.users[0];n._notifyReloadListener(s);const i=(p=s.providerUserInfo)!=null&&p.length?Qf(s.providerUserInfo):[],o=_I(n.providerData,i),c=n.isAnonymous,u=!(n.email&&s.passwordHash)&&!(o!=null&&o.length),h=c?u:!1,f={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new Sc(s.createdAt,s.lastLoginAt),isAnonymous:h};Object.assign(n,f)}async function gI(n){const e=ve(n);await ko(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function _I(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Qf(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function yI(n,e){const t=await Hf(n,{},async()=>{const r=_i({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=await Wf(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:r};return n.emulatorConfig&&yi(n.emulatorConfig.host)&&(u.credentials="include"),Kf.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function II(n,e){return Vn(n,"POST","/v2/accounts:revokeToken",Sn(n,e))}/**
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
 */class Mr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){G(e.idToken,"internal-error"),G(typeof e.idToken<"u","internal-error"),G(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Uh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){G(e.length!==0,"internal-error");const t=Uh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(G(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await yI(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new Mr;return r&&(G(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(G(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(G(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Mr,this.toJSON())}_performRefresh(){return kt("not implemented")}}/**
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
 */function en(n,e){G(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class ht{constructor({uid:e,auth:t,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new mI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Sc(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Ys(this,this.stsTokenManager.getToken(this.auth,e));return G(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return fI(this,e)}reload(){return gI(this)}_assign(e){this!==e&&(G(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new ht({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){G(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await ko(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ge(this.auth.app))return Promise.reject(Lt(this.auth));const e=await this.getIdToken();return await Ys(this,dI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const r=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,u=t._redirectEventId??void 0,h=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:p,emailVerified:g,isAnonymous:P,providerData:V,stsTokenManager:L}=t;G(p&&L,e,"internal-error");const k=Mr.fromJSON(this.name,L);G(typeof p=="string",e,"internal-error"),en(r,e.name),en(s,e.name),G(typeof g=="boolean",e,"internal-error"),G(typeof P=="boolean",e,"internal-error"),en(i,e.name),en(o,e.name),en(c,e.name),en(u,e.name),en(h,e.name),en(f,e.name);const $=new ht({uid:p,auth:e,email:s,emailVerified:g,displayName:r,isAnonymous:P,photoURL:o,phoneNumber:i,tenantId:c,stsTokenManager:k,createdAt:h,lastLoginAt:f});return V&&Array.isArray(V)&&($.providerData=V.map(K=>({...K}))),u&&($._redirectEventId=u),$}static async _fromIdTokenResponse(e,t,r=!1){const s=new Mr;s.updateFromServerResponse(t);const i=new ht({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await ko(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];G(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Qf(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Mr;c.updateFromIdToken(r);const u=new ht({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Sc(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,h),u}}/**
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
 */const Fh=new Map;function Ot(n){Ft(n instanceof Function,"Expected a class definition");let e=Fh.get(n);return e?(Ft(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Fh.set(n,e),e)}/**
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
 */class Yf{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Yf.type="NONE";const Bh=Yf;/**
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
 */function go(n,e,t){return`firebase:${n}:${e}:${t}`}class Qn{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=go(this.userKey,s.apiKey,i),this.fullPersistenceKey=go("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t);try{this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}catch{}}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await No(this.auth,{idToken:e}).catch(()=>{});return t?ht._fromGetAccountInfoResponse(this.auth,t,e):null}return ht._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){try{this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}catch{}}static async create(e,t,r="authUser"){if(!t.length)return new Qn(Ot(Bh),e,r);const s=(await Promise.all(t.map(async h=>{try{if(await h._isAvailable())return h}catch{return}}))).filter(h=>h);let i=s[0]||Ot(Bh);const o=go(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const f=await h._get(o);if(f){let p;if(typeof f=="string"){const g=await No(e,{idToken:f}).catch(()=>{});if(!g)break;p=await ht._fromGetAccountInfoResponse(e,g,f)}else p=ht._fromJSON(e,f);h!==i&&(c=p),i=h;break}}catch{}const u=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new Qn(i,e,r):(i=u[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new Qn(i,e,r))}}/**
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
 */function qh(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(ep(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Jf(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(np(e))return"Blackberry";if(rp(e))return"Webos";if(Xf(e))return"Safari";if((e.includes("chrome/")||Zf(e))&&!e.includes("edge/"))return"Chrome";if(tp(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Jf(n=we()){return/firefox\//i.test(n)}function Xf(n=we()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Zf(n=we()){return/crios\//i.test(n)}function ep(n=we()){return/iemobile/i.test(n)}function tp(n=we()){return/android/i.test(n)}function np(n=we()){return/blackberry/i.test(n)}function rp(n=we()){return/webos/i.test(n)}function lu(n=we()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function EI(n=we()){var e;return lu(n)&&!!((e=window.navigator)!=null&&e.standalone)}function TI(){return K_()&&document.documentMode===10}function sp(n=we()){return lu(n)||tp(n)||rp(n)||np(n)||/windows phone/i.test(n)||ep(n)}/**
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
 */function ip(n,e=[]){let t;switch(n){case"Browser":t=qh(we());break;case"Worker":t=`${qh(we())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${mr}/${r}`}/**
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
 */class wI{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,c)=>{try{const u=e(i);o(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function vI(n,e={}){return Vn(n,"GET","/v2/passwordPolicy",Sn(n,e))}/**
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
 */const AI=6;class RI{constructor(e){var r;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??AI,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class PI{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new $h(this),this.idTokenSubscription=new $h(this),this.beforeStateQueue=new wI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Gf,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ot(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted){try{this.persistenceManager=await Qn.create(this,e)}catch(o){po(`Failed to initialize persistence: ${o}`),this.persistenceManager=await Qn.create(this,[])}finally{(r=this._resolvePersistenceManagerAvailable)==null||r.call(this)}if(!this._deleted){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}try{await this.initializeCurrentUser(t)}catch(o){po(`Failed to initialize current user: ${o}`),await this.directlySetCurrentUser(null).catch(()=>{})}this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await No(this,{idToken:e}),r=await ht._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Ge(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let r=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=r==null?void 0:r._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(r=u.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return G(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ko(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=sI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ge(this.app))return Promise.reject(Lt(this));const t=e?ve(e):null;return t&&G(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&G(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ge(this.app)?Promise.reject(Lt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ge(this.app)?Promise.reject(Lt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ot(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await vI(this),t=new RI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new gi("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await II(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Ot(e)||this._popupRedirectResolver;G(t,this,"argument-error"),this.redirectPersistenceManager=await Qn.create(this,[Ot(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(G(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}).catch(u=>{if(!o)if(typeof t!="function"&&t.error)t.error(u);else if(r)r(u);else throw u}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){if(this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,this.persistenceManager)try{e?await this.persistenceManager.setCurrentUser(e):await this.persistenceManager.removeCurrentUser()}catch(t){const r=(t==null?void 0:t.message)||String(t),s=aa(this,"internal-error",`An internal AuthError has occurred: ${r}`);throw s.customData={originalError:t},s}}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return G(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ip(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var t;if(Ge(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&po(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Cn(n){return ve(n)}class $h{constructor(e){this.auth=e,this.observer=null,this.addObserver=J_(t=>this.observer=t)}get next(){return G(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let ca={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function bI(n){ca=n}function op(n){return ca.loadJS(n)}function SI(){return ca.recaptchaEnterpriseScript}function VI(){return ca.gapiScript}function CI(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class xI{constructor(){this.enterprise=new DI}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class DI{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}/**
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
 */const NI="recaptcha-enterprise",ap="NO_RECAPTCHA",jh="onFirebaseAuthREInstanceReady";class on{constructor(e){this.type=NI,this.auth=Cn(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,c)=>{hI(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const h=new lI(u);return i.tenantId==null?i._agentRecaptchaConfig=h:i._tenantRecaptchaConfigs[i.tenantId]=h,o(h.siteKey)}}).catch(u=>{c(u)})})}function s(i,o,c){const u=window.grecaptcha;Mh(u)?u.enterprise.ready(()=>{u.enterprise.execute(i,{action:e}).then(h=>{o(h)}).catch(()=>{o(ap)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new xI().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{r(this.auth).then(async c=>{if(!t&&Mh(window.grecaptcha)&&on.scriptInjectionDeferred)await on.scriptInjectionDeferred.promise,s(c,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=SI();u.length!==0&&(u+=c+`&onload=${jh}`),on.scriptInjectionDeferred=new Of,window[jh]=()=>{var h;(h=on.scriptInjectionDeferred)==null||h.resolve()},op(u).then(()=>{var h;return(h=on.scriptInjectionDeferred)==null?void 0:h.promise}).then(()=>{s(c,i,o)}).catch(h=>{o(h)})}}).catch(c=>{o(c)})})}}on.scriptInjectionDeferred=null;async function zh(n,e,t,r=!1,s=!1){const i=new on(n);let o;if(s)o=ap;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const u=c.phoneEnrollmentInfo.phoneNumber,h=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:h,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const u=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return r?Object.assign(c,{captchaResp:o}):Object.assign(c,{captchaResponse:o}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Vc(n,e,t,r,s){var i;if((i=n._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await zh(n,e,t,t==="getOobCode");return r(n,o)}else return r(n,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await zh(n,e,t,t==="getOobCode");return r(n,c)}else return Promise.reject(o)})}/**
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
 */function kI(n,e){const t=ou(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(sr(i,e??{}))return s;at(s,"already-initialized")}return t.initialize({options:e})}function OI(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Ot);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function LI(n,e,t){const r=Cn(n);G(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=cp(e),{host:o,port:c}=MI(e),u=c===null?"":`:${c}`,h={url:`${i}//${o}${u}/`},f=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){G(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),G(sr(h,r.config.emulator)&&sr(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,yi(o)?Bf(`${i}//${o}${u}`):UI()}function cp(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function MI(n){const e=cp(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Gh(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:Gh(o)}}}function Gh(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function UI(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class hu{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return kt("not implemented")}_getIdTokenResponse(e){return kt("not implemented")}_linkToIdToken(e,t){return kt("not implemented")}_getReauthenticationResolver(e){return kt("not implemented")}}async function FI(n,e){return Vn(n,"POST","/v1/accounts:signUp",e)}/**
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
 */async function BI(n,e){return Ei(n,"POST","/v1/accounts:signInWithPassword",Sn(n,e))}/**
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
 */async function qI(n,e){return Ei(n,"POST","/v1/accounts:signInWithEmailLink",Sn(n,e))}async function $I(n,e){return Ei(n,"POST","/v1/accounts:signInWithEmailLink",Sn(n,e))}/**
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
 */class Js extends hu{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Js(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Js(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Vc(e,t,"signInWithPassword",BI);case"emailLink":return qI(e,{email:this._email,oobCode:this._password});default:at(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Vc(e,r,"signUpPassword",FI);case"emailLink":return $I(e,{idToken:t,email:this._email,oobCode:this._password});default:at(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Ur(n,e){return Ei(n,"POST","/v1/accounts:signInWithIdp",Sn(n,e))}/**
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
 */const jI="http://localhost";class or extends hu{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new or(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):at("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=t;if(!r||!s)return null;const o=new or(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Ur(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Ur(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Ur(e,t)}buildRequest(){const e={requestUri:jI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=_i(t)}return e}}/**
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
 */function zI(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function GI(n){const e=Vs(Cs(n)).link,t=e?Vs(Cs(e)).deep_link_id:null,r=Vs(Cs(n)).deep_link_id;return(r?Vs(Cs(r)).link:null)||r||t||e||n}class du{constructor(e){const t=Vs(Cs(e)),r=t.apiKey??null,s=t.oobCode??null,i=zI(t.mode??null);G(r&&s&&i,"argument-error"),this.apiKey=r,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=GI(e);try{return new du(t)}catch{return null}}}/**
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
 */class es{constructor(){this.providerId=es.PROVIDER_ID}static credential(e,t){return Js._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=du.parseLink(t);return G(r,"argument-error"),Js._fromEmailAndCode(e,r.code,r.tenantId)}}es.PROVIDER_ID="password";es.EMAIL_PASSWORD_SIGN_IN_METHOD="password";es.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class fu{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Ti extends fu{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class an extends Ti{constructor(){super("facebook.com")}static credential(e){return or._fromParams({providerId:an.PROVIDER_ID,signInMethod:an.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return an.credentialFromTaggedObject(e)}static credentialFromError(e){return an.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return an.credential(e.oauthAccessToken)}catch{return null}}}an.FACEBOOK_SIGN_IN_METHOD="facebook.com";an.PROVIDER_ID="facebook.com";/**
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
 */class cn extends Ti{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return or._fromParams({providerId:cn.PROVIDER_ID,signInMethod:cn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return cn.credentialFromTaggedObject(e)}static credentialFromError(e){return cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return cn.credential(t,r)}catch{return null}}}cn.GOOGLE_SIGN_IN_METHOD="google.com";cn.PROVIDER_ID="google.com";/**
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
 */class un extends Ti{constructor(){super("github.com")}static credential(e){return or._fromParams({providerId:un.PROVIDER_ID,signInMethod:un.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return un.credentialFromTaggedObject(e)}static credentialFromError(e){return un.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return un.credential(e.oauthAccessToken)}catch{return null}}}un.GITHUB_SIGN_IN_METHOD="github.com";un.PROVIDER_ID="github.com";/**
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
 */class ln extends Ti{constructor(){super("twitter.com")}static credential(e,t){return or._fromParams({providerId:ln.PROVIDER_ID,signInMethod:ln.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ln.credentialFromTaggedObject(e)}static credentialFromError(e){return ln.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ln.credential(t,r)}catch{return null}}}ln.TWITTER_SIGN_IN_METHOD="twitter.com";ln.PROVIDER_ID="twitter.com";/**
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
 */async function KI(n,e){return Ei(n,"POST","/v1/accounts:signUp",Sn(n,e))}/**
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
 */class ar{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await ht._fromIdTokenResponse(e,r,s),o=Kh(r);return new ar({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Kh(r);return new ar({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Kh(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */class Oo extends xt{constructor(e,t,r,s){super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Oo.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Oo(e,t,r,s)}}function up(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Oo._fromErrorAndOperation(n,i,e,r):i})}async function HI(n,e,t=!1){const r=await Ys(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return ar._forOperation(n,"link",r)}/**
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
 */async function WI(n,e,t=!1){const{auth:r}=n;if(Ge(r.app))return Promise.reject(Lt(r));const s="reauthenticate";try{const i=await Ys(n,up(r,s,e,n),t);G(i.idToken,r,"internal-error");const o=uu(i.idToken);G(o,r,"internal-error");const{sub:c}=o;return G(n.uid===c,r,"user-mismatch"),ar._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&at(r,"user-mismatch"),i}}/**
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
 */async function lp(n,e,t=!1){if(Ge(n.app))return Promise.reject(Lt(n));const r="signIn",s=await up(n,r,e),i=await ar._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function QI(n,e){return lp(Cn(n),e)}/**
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
 */async function hp(n){const e=Cn(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function XP(n,e,t){if(Ge(n.app))return Promise.reject(Lt(n));const r=Cn(n),o=await Vc(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",KI).catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&hp(n),u}),c=await ar._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(c.user),c}function ZP(n,e,t){return Ge(n.app)?Promise.reject(Lt(n)):QI(ve(n),es.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&hp(n),r})}function YI(n,e,t,r){return ve(n).onIdTokenChanged(e,t,r)}function JI(n,e,t){return ve(n).beforeAuthStateChanged(e,t)}function eb(n){return ve(n).signOut()}const Lo="__sak";/**
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
 */class dp{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Lo,"1"),this.storage.removeItem(Lo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const XI=1e3,ZI=10;class fp extends dp{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=sp(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);TI()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,ZI):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},XI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}fp.type="LOCAL";const eE=fp;/**
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
 */class pp extends dp{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}pp.type="SESSION";const mp=pp;/**
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
 */function tE(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class ua{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new ua(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(o).map(async h=>h(t.origin,i)),u=await tE(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ua.receivers=[];/**
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
 */function pu(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class nE{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((c,u)=>{const h=pu("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(p){const g=p;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(g.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function vt(){return window}function rE(n){vt().location.href=n}/**
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
 */function gp(){return typeof vt().WorkerGlobalScope<"u"&&typeof vt().importScripts=="function"}async function sE(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function iE(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function oE(){return gp()?self:null}/**
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
 */const _p="firebaseLocalStorageDb",aE=1,Mo="firebaseLocalStorage",yp="fbase_key";class wi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function la(n,e){return n.transaction([Mo],e?"readwrite":"readonly").objectStore(Mo)}function cE(){const n=indexedDB.deleteDatabase(_p);return new wi(n).toPromise()}function Ip(){const n=indexedDB.open(_p,aE);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Mo,{keyPath:yp})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Mo)?e(r):(r.close(),await cE(),e(await Ip()))})})}async function Hh(n,e,t){const r=la(n,!0).put({[yp]:e,value:t});return new wi(r).toPromise()}async function uE(n,e){const t=la(n,!1).get(e),r=await new wi(t).toPromise();return r===void 0?null:r.value}function Wh(n,e){const t=la(n,!0).delete(e);return new wi(t).toPromise()}const lE=800,hE=3;class Ep{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=Ip(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>hE)throw r;if(this.dbPromise){const s=this.dbPromise;this.dbPromise=null;try{(await s).close()}catch{}}}}async initializeServiceWorkerMessaging(){return gp()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ua._getInstance(oE()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,r;if(this.activeServiceWorker=await sE(),!this.activeServiceWorker)return;this.sender=new nE(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||iE()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Hh(e,Lo,"1"),await Wh(e,Lo)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Hh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>uE(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Wh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const i=la(s,!1).getAll();return new wi(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||po(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),lE)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Ep.type="LOCAL";const dE=Ep;new Ii(3e4,6e4);/**
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
 */function Tp(n,e){return e?Ot(e):(G(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class mu extends hu{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Ur(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Ur(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Ur(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function fE(n){return lp(n.auth,new mu(n),n.bypassAuthState)}function pE(n){const{auth:e,user:t}=n;return G(t,e,"internal-error"),WI(t,new mu(n),n.bypassAuthState)}async function mE(n){const{auth:e,user:t}=n;return G(t,e,"internal-error"),HI(t,new mu(n),n.bypassAuthState)}/**
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
 */class wp{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return fE;case"linkViaPopup":case"linkViaRedirect":return mE;case"reauthViaPopup":case"reauthViaRedirect":return pE;default:at(this.auth,"internal-error")}}resolve(e){Ft(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ft(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const gE=new Ii(2e3,1e4);async function tb(n,e,t){if(Ge(n.app))return Promise.reject(ft(n,"operation-not-supported-in-this-environment"));const r=Cn(n);tI(n,e,fu);const s=Tp(r,t);return new Kn(r,"signInViaPopup",e,s).executeNotNull()}class Kn extends wp{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Kn.currentPopupAction&&Kn.currentPopupAction.cancel(),Kn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return G(e,this.auth,"internal-error"),e}async onExecution(){Ft(this.filter.length===1,"Popup operations only handle one event");const e=pu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ft(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(ft(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Kn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ft(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,gE.get())};e()}}Kn.currentPopupAction=null;/**
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
 */const _E="pendingRedirect",_o=new Map;class yE extends wp{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=_o.get(this.auth._key());if(!e){try{const r=await IE(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}_o.set(this.auth._key(),e)}return this.bypassAuthState||_o.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function IE(n,e){const t=wE(e),r=TE(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function EE(n,e){_o.set(n._key(),e)}function TE(n){return Ot(n._redirectPersistence)}function wE(n){return go(_E,n.config.apiKey,n.name)}async function vE(n,e,t=!1){if(Ge(n.app))return Promise.reject(Lt(n));const r=Cn(n),s=Tp(r,e),o=await new yE(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
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
 */const AE=600*1e3;class RE{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!PE(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!vp(e)){const s=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(ft(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=AE&&this.cachedEventUids.clear(),this.cachedEventUids.has(Qh(e))}saveEventToCache(e){this.cachedEventUids.add(Qh(e)),this.lastProcessedEventTime=Date.now()}}function Qh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function vp({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function PE(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return vp(n);default:return!1}}/**
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
 */async function bE(n,e={}){return Vn(n,"GET","/v1/projects",e)}/**
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
 */const SE=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,VE=/^https?/;async function CE(n){if(n.config.emulator)return;const{authorizedDomains:e}=await bE(n);for(const t of e)try{if(xE(t))return}catch{}at(n,"unauthorized-domain")}function xE(n){const e=bc(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!VE.test(t))return!1;if(SE.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const DE=new Ii(3e4,6e4);function Yh(){const n=vt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function NE(n){return new Promise((e,t)=>{var s,i,o;function r(){Yh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Yh(),t(ft(n,"network-request-failed"))},timeout:DE.get()})}if((i=(s=vt().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=vt().gapi)!=null&&o.load)r();else{const c=CI("iframefcb");return vt()[c]=()=>{gapi.load?r():t(ft(n,"network-request-failed"))},op(`${VI()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw yo=null,e})}let yo=null;function kE(n){return yo=yo||NE(n),yo}/**
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
 */const OE=new Ii(5e3,15e3),LE="__/auth/iframe",ME="emulator/auth/iframe",UE={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},FE=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function BE(n){const e=n.config;G(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?cu(e,ME):`https://${n.config.authDomain}/${LE}`,r={apiKey:e.apiKey,appName:n.name,v:mr},s=FE.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${_i(r).slice(1)}`}async function qE(n){const e=await kE(n),t=vt().gapi;return G(t,n,"internal-error"),e.open({where:document.body,url:BE(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:UE,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=ft(n,"network-request-failed"),c=vt().setTimeout(()=>{i(o)},OE.get());function u(){vt().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{i(o)})}))}/**
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
 */const $E={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},jE=500,zE=600,GE="_blank",KE="http://localhost";class Jh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function HE(n,e,t,r=jE,s=zE){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u={...$E,width:r.toString(),height:s.toString(),top:i,left:o},h=we().toLowerCase();t&&(c=Zf(h)?GE:t),Jf(h)&&(e=e||KE,u.scrollbars="yes");const f=Object.entries(u).reduce((g,[P,V])=>`${g}${P}=${V},`,"");if(EI(h)&&c!=="_self")return WE(e||"",c),new Jh(null);const p=window.open(e||"",c,f);G(p,n,"popup-blocked");try{p.focus()}catch{}return new Jh(p)}function WE(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const QE="__/auth/handler",YE="emulator/auth/handler",JE=encodeURIComponent("fac");async function Xh(n,e,t,r,s,i){G(n.config.authDomain,n,"auth-domain-config-required"),G(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:mr,eventId:s};if(e instanceof fu){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Y_(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof Ti){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),h=u?`#${JE}=${encodeURIComponent(u)}`:"";return`${XE(n)}?${_i(c).slice(1)}${h}`}function XE({config:n}){return n.emulator?cu(n,YE):`https://${n.authDomain}/${QE}`}/**
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
 */const fc="webStorageSupport";class ZE{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=mp,this._completeRedirectFn=vE,this._overrideRedirectResult=EE}async _openPopup(e,t,r,s){var o;Ft((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await Xh(e,t,r,bc(),s);return HE(e,i,pu())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await Xh(e,t,r,bc(),s);return rE(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Ft(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await qE(e),r=new RE(e);return t.register("authEvent",s=>(G(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(fc,{type:fc},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[fc];i!==void 0&&t(!!i),at(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=CE(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return sp()||Xf()||lu()}}const eT=ZE;var Zh="@firebase/auth",ed="1.13.6";/**
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
 */class tT{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){G(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function nT(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function rT(n){ir(new In("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;G(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ip(n)},h=new PI(r,s,i,u);return OI(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),ir(new In("auth-internal",e=>{const t=Cn(e.getProvider("auth").getImmediate());return(r=>new tT(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),wt(Zh,ed,nT(n)),wt(Zh,ed,"esm2020")}/**
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
 */const sT=300,iT=kf("authIdTokenMaxAge")||sT;let td=null;const oT=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>iT)return;const s=t==null?void 0:t.token;td!==s&&(td=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function nb(n=qf()){const e=ou(n,"auth");if(e.isInitialized())return e.getImmediate();const t=kI(n,{popupRedirectResolver:eT,persistence:[dE,eE,mp]}),r=kf("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=oT(i.toString());JI(t,o,()=>o(t.currentUser)),YI(t,c=>o(c))}}const s=Df("auth");return s&&LI(t,`http://${s}`),t}function aT(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}bI({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=ft("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",aT().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});rT("Browser");var nd=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pn,Ap;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(E,_){function I(){}I.prototype=_.prototype,E.F=_.prototype,E.prototype=new I,E.prototype.constructor=E,E.D=function(v,w,b){for(var y=Array(arguments.length-2),ze=2;ze<arguments.length;ze++)y[ze-2]=arguments[ze];return _.prototype[w].apply(v,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(E,_,I){I||(I=0);const v=Array(16);if(typeof _=="string")for(var w=0;w<16;++w)v[w]=_.charCodeAt(I++)|_.charCodeAt(I++)<<8|_.charCodeAt(I++)<<16|_.charCodeAt(I++)<<24;else for(w=0;w<16;++w)v[w]=_[I++]|_[I++]<<8|_[I++]<<16|_[I++]<<24;_=E.g[0],I=E.g[1],w=E.g[2];let b=E.g[3],y;y=_+(b^I&(w^b))+v[0]+3614090360&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[1]+3905402710&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[2]+606105819&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[3]+3250441966&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(b^I&(w^b))+v[4]+4118548399&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[5]+1200080426&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[6]+2821735955&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[7]+4249261313&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(b^I&(w^b))+v[8]+1770035416&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[9]+2336552879&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[10]+4294925233&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[11]+2304563134&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(b^I&(w^b))+v[12]+1804603682&4294967295,_=I+(y<<7&4294967295|y>>>25),y=b+(w^_&(I^w))+v[13]+4254626195&4294967295,b=_+(y<<12&4294967295|y>>>20),y=w+(I^b&(_^I))+v[14]+2792965006&4294967295,w=b+(y<<17&4294967295|y>>>15),y=I+(_^w&(b^_))+v[15]+1236535329&4294967295,I=w+(y<<22&4294967295|y>>>10),y=_+(w^b&(I^w))+v[1]+4129170786&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[6]+3225465664&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[11]+643717713&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[0]+3921069994&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^b&(I^w))+v[5]+3593408605&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[10]+38016083&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[15]+3634488961&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[4]+3889429448&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^b&(I^w))+v[9]+568446438&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[14]+3275163606&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[3]+4107603335&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[8]+1163531501&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(w^b&(I^w))+v[13]+2850285829&4294967295,_=I+(y<<5&4294967295|y>>>27),y=b+(I^w&(_^I))+v[2]+4243563512&4294967295,b=_+(y<<9&4294967295|y>>>23),y=w+(_^I&(b^_))+v[7]+1735328473&4294967295,w=b+(y<<14&4294967295|y>>>18),y=I+(b^_&(w^b))+v[12]+2368359562&4294967295,I=w+(y<<20&4294967295|y>>>12),y=_+(I^w^b)+v[5]+4294588738&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[8]+2272392833&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[11]+1839030562&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[14]+4259657740&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^b)+v[1]+2763975236&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[4]+1272893353&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[7]+4139469664&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[10]+3200236656&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^b)+v[13]+681279174&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[0]+3936430074&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[3]+3572445317&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[6]+76029189&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(I^w^b)+v[9]+3654602809&4294967295,_=I+(y<<4&4294967295|y>>>28),y=b+(_^I^w)+v[12]+3873151461&4294967295,b=_+(y<<11&4294967295|y>>>21),y=w+(b^_^I)+v[15]+530742520&4294967295,w=b+(y<<16&4294967295|y>>>16),y=I+(w^b^_)+v[2]+3299628645&4294967295,I=w+(y<<23&4294967295|y>>>9),y=_+(w^(I|~b))+v[0]+4096336452&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[7]+1126891415&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[14]+2878612391&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[5]+4237533241&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~b))+v[12]+1700485571&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[3]+2399980690&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[10]+4293915773&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[1]+2240044497&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~b))+v[8]+1873313359&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[15]+4264355552&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[6]+2734768916&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[13]+1309151649&4294967295,I=w+(y<<21&4294967295|y>>>11),y=_+(w^(I|~b))+v[4]+4149444226&4294967295,_=I+(y<<6&4294967295|y>>>26),y=b+(I^(_|~w))+v[11]+3174756917&4294967295,b=_+(y<<10&4294967295|y>>>22),y=w+(_^(b|~I))+v[2]+718787259&4294967295,w=b+(y<<15&4294967295|y>>>17),y=I+(b^(w|~_))+v[9]+3951481745&4294967295,E.g[0]=E.g[0]+_&4294967295,E.g[1]=E.g[1]+(w+(y<<21&4294967295|y>>>11))&4294967295,E.g[2]=E.g[2]+w&4294967295,E.g[3]=E.g[3]+b&4294967295}r.prototype.v=function(E,_){_===void 0&&(_=E.length);const I=_-this.blockSize,v=this.C;let w=this.h,b=0;for(;b<_;){if(w==0)for(;b<=I;)s(this,E,b),b+=this.blockSize;if(typeof E=="string"){for(;b<_;)if(v[w++]=E.charCodeAt(b++),w==this.blockSize){s(this,v),w=0;break}}else for(;b<_;)if(v[w++]=E[b++],w==this.blockSize){s(this,v),w=0;break}}this.h=w,this.o+=_},r.prototype.A=function(){var E=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);E[0]=128;for(var _=1;_<E.length-8;++_)E[_]=0;_=this.o*8;for(var I=E.length-8;I<E.length;++I)E[I]=_&255,_/=256;for(this.v(E),E=Array(16),_=0,I=0;I<4;++I)for(let v=0;v<32;v+=8)E[_++]=this.g[I]>>>v&255;return E};function i(E,_){var I=c;return Object.prototype.hasOwnProperty.call(I,E)?I[E]:I[E]=_(E)}function o(E,_){this.h=_;const I=[];let v=!0;for(let w=E.length-1;w>=0;w--){const b=E[w]|0;v&&b==_||(I[w]=b,v=!1)}this.g=I}var c={};function u(E){return-128<=E&&E<128?i(E,function(_){return new o([_|0],_<0?-1:0)}):new o([E|0],E<0?-1:0)}function h(E){if(isNaN(E)||!isFinite(E))return p;if(E<0)return k(h(-E));const _=[];let I=1;for(let v=0;E>=I;v++)_[v]=E/I|0,I*=4294967296;return new o(_,0)}function f(E,_){if(E.length==0)throw Error("number format error: empty string");if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(E.charAt(0)=="-")return k(f(E.substring(1),_));if(E.indexOf("-")>=0)throw Error('number format error: interior "-" character');const I=h(Math.pow(_,8));let v=p;for(let b=0;b<E.length;b+=8){var w=Math.min(8,E.length-b);const y=parseInt(E.substring(b,b+w),_);w<8?(w=h(Math.pow(_,w)),v=v.j(w).add(h(y))):(v=v.j(I),v=v.add(h(y)))}return v}var p=u(0),g=u(1),P=u(16777216);n=o.prototype,n.m=function(){if(L(this))return-k(this).m();let E=0,_=1;for(let I=0;I<this.g.length;I++){const v=this.i(I);E+=(v>=0?v:4294967296+v)*_,_*=4294967296}return E},n.toString=function(E){if(E=E||10,E<2||36<E)throw Error("radix out of range: "+E);if(V(this))return"0";if(L(this))return"-"+k(this).toString(E);const _=h(Math.pow(E,6));var I=this;let v="";for(;;){const w=X(I,_).g;I=$(I,w.j(_));let b=((I.g.length>0?I.g[0]:I.h)>>>0).toString(E);if(I=w,V(I))return b+v;for(;b.length<6;)b="0"+b;v=b+v}},n.i=function(E){return E<0?0:E<this.g.length?this.g[E]:this.h};function V(E){if(E.h!=0)return!1;for(let _=0;_<E.g.length;_++)if(E.g[_]!=0)return!1;return!0}function L(E){return E.h==-1}n.l=function(E){return E=$(this,E),L(E)?-1:V(E)?0:1};function k(E){const _=E.g.length,I=[];for(let v=0;v<_;v++)I[v]=~E.g[v];return new o(I,~E.h).add(g)}n.abs=function(){return L(this)?k(this):this},n.add=function(E){const _=Math.max(this.g.length,E.g.length),I=[];let v=0;for(let w=0;w<=_;w++){let b=v+(this.i(w)&65535)+(E.i(w)&65535),y=(b>>>16)+(this.i(w)>>>16)+(E.i(w)>>>16);v=y>>>16,b&=65535,y&=65535,I[w]=y<<16|b}return new o(I,I[I.length-1]&-2147483648?-1:0)};function $(E,_){return E.add(k(_))}n.j=function(E){if(V(this)||V(E))return p;if(L(this))return L(E)?k(this).j(k(E)):k(k(this).j(E));if(L(E))return k(this.j(k(E)));if(this.l(P)<0&&E.l(P)<0)return h(this.m()*E.m());const _=this.g.length+E.g.length,I=[];for(var v=0;v<2*_;v++)I[v]=0;for(v=0;v<this.g.length;v++)for(let w=0;w<E.g.length;w++){const b=this.i(v)>>>16,y=this.i(v)&65535,ze=E.i(w)>>>16,Nn=E.i(w)&65535;I[2*v+2*w]+=y*Nn,K(I,2*v+2*w),I[2*v+2*w+1]+=b*Nn,K(I,2*v+2*w+1),I[2*v+2*w+1]+=y*ze,K(I,2*v+2*w+1),I[2*v+2*w+2]+=b*ze,K(I,2*v+2*w+2)}for(E=0;E<_;E++)I[E]=I[2*E+1]<<16|I[2*E];for(E=_;E<2*_;E++)I[E]=0;return new o(I,0)};function K(E,_){for(;(E[_]&65535)!=E[_];)E[_+1]+=E[_]>>>16,E[_]&=65535,_++}function j(E,_){this.g=E,this.h=_}function X(E,_){if(V(_))throw Error("division by zero");if(V(E))return new j(p,p);if(L(E))return _=X(k(E),_),new j(k(_.g),k(_.h));if(L(_))return _=X(E,k(_)),new j(k(_.g),_.h);if(E.g.length>30){if(L(E)||L(_))throw Error("slowDivide_ only works with positive integers.");for(var I=g,v=_;v.l(E)<=0;)I=J(I),v=J(v);var w=ee(I,1),b=ee(v,1);for(v=ee(v,2),I=ee(I,2);!V(v);){var y=b.add(v);y.l(E)<=0&&(w=w.add(I),b=y),v=ee(v,1),I=ee(I,1)}return _=$(E,w.j(_)),new j(w,_)}for(w=p;E.l(_)>=0;){for(I=Math.max(1,Math.floor(E.m()/_.m())),v=Math.ceil(Math.log(I)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),b=h(I),y=b.j(_);L(y)||y.l(E)>0;)I-=v,b=h(I),y=b.j(_);V(b)&&(b=g),w=w.add(b),E=$(E,y)}return new j(w,E)}n.B=function(E){return X(this,E).h},n.and=function(E){const _=Math.max(this.g.length,E.g.length),I=[];for(let v=0;v<_;v++)I[v]=this.i(v)&E.i(v);return new o(I,this.h&E.h)},n.or=function(E){const _=Math.max(this.g.length,E.g.length),I=[];for(let v=0;v<_;v++)I[v]=this.i(v)|E.i(v);return new o(I,this.h|E.h)},n.xor=function(E){const _=Math.max(this.g.length,E.g.length),I=[];for(let v=0;v<_;v++)I[v]=this.i(v)^E.i(v);return new o(I,this.h^E.h)};function J(E){const _=E.g.length+1,I=[];for(let v=0;v<_;v++)I[v]=E.i(v)<<1|E.i(v-1)>>>31;return new o(I,E.h)}function ee(E,_){const I=_>>5;_%=32;const v=E.g.length-I,w=[];for(let b=0;b<v;b++)w[b]=_>0?E.i(b+I)>>>_|E.i(b+I+1)<<32-_:E.i(b+I);return new o(w,E.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,Ap=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,pn=o}).apply(typeof nd<"u"?nd:typeof self<"u"?self:typeof window<"u"?window:{});var ro=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Rp,xs,Pp,Io,Cc,bp,Sp,Vp;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof ro=="object"&&ro];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function s(a,l){if(l)e:{var d=r;a=a.split(".");for(var m=0;m<a.length-1;m++){var R=a[m];if(!(R in d))break e;d=d[R]}a=a[a.length-1],m=d[a],l=l(m),l!=m&&l!=null&&e(d,a,{configurable:!0,writable:!0,value:l})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(l){var d=[],m;for(m in l)Object.prototype.hasOwnProperty.call(l,m)&&d.push([m,l[m]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function c(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function u(a,l,d){return a.call.apply(a.bind,arguments)}function h(a,l,d){return h=u,h.apply(null,arguments)}function f(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var m=d.slice();return m.push.apply(m,arguments),a.apply(this,m)}}function p(a,l){function d(){}d.prototype=l.prototype,a.Z=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(m,R,S){for(var U=Array(arguments.length-2),Y=2;Y<arguments.length;Y++)U[Y-2]=arguments[Y];return l.prototype[R].apply(m,U)}}var g=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function P(a){const l=a.length;if(l>0){const d=Array(l);for(let m=0;m<l;m++)d[m]=a[m];return d}return[]}function V(a,l){for(let m=1;m<arguments.length;m++){const R=arguments[m];var d=typeof R;if(d=d!="object"?d:R?Array.isArray(R)?"array":d:"null",d=="array"||d=="object"&&typeof R.length=="number"){d=a.length||0;const S=R.length||0;a.length=d+S;for(let U=0;U<S;U++)a[d+U]=R[U]}else a.push(R)}}class L{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return this.h>0?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function k(a){o.setTimeout(()=>{throw a},0)}function $(){var a=E;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class K{constructor(){this.h=this.g=null}add(l,d){const m=j.get();m.set(l,d),this.h?this.h.next=m:this.g=m,this.h=m}}var j=new L(()=>new X,a=>a.reset());class X{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let J,ee=!1,E=new K,_=()=>{const a=Promise.resolve(void 0);J=()=>{a.then(I)}};function I(){for(var a;a=$();){try{a.h.call(a.g)}catch(d){k(d)}var l=j;l.j(a),l.h<100&&(l.h++,a.next=l.g,l.g=a)}ee=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var b=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,l),o.removeEventListener("test",d,l)}catch{}return a})();function y(a){return/^[\s\xa0]*$/.test(a)}function ze(a,l){w.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,l)}p(ze,w),ze.prototype.init=function(a,l){const d=this.type=a.type,m=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget,l||(d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement)),this.relatedTarget=l,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&ze.Z.h.call(this)},ze.prototype.h=function(){ze.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Nn="closure_listenable_"+(Math.random()*1e6|0),e_=0;function t_(a,l,d,m,R){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!m,this.ha=R,this.key=++e_,this.da=this.fa=!1}function qi(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function $i(a,l,d){for(const m in a)l.call(d,a[m],m,a)}function n_(a,l){for(const d in a)l.call(void 0,a[d],d,a)}function Sl(a){const l={};for(const d in a)l[d]=a[d];return l}const Vl="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Cl(a,l){let d,m;for(let R=1;R<arguments.length;R++){m=arguments[R];for(d in m)a[d]=m[d];for(let S=0;S<Vl.length;S++)d=Vl[S],Object.prototype.hasOwnProperty.call(m,d)&&(a[d]=m[d])}}function ji(a){this.src=a,this.g={},this.h=0}ji.prototype.add=function(a,l,d,m,R){const S=a.toString();a=this.g[S],a||(a=this.g[S]=[],this.h++);const U=qa(a,l,m,R);return U>-1?(l=a[U],d||(l.fa=!1)):(l=new t_(l,this.src,S,!!m,R),l.fa=d,a.push(l)),l};function Ba(a,l){const d=l.type;if(d in a.g){var m=a.g[d],R=Array.prototype.indexOf.call(m,l,void 0),S;(S=R>=0)&&Array.prototype.splice.call(m,R,1),S&&(qi(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function qa(a,l,d,m){for(let R=0;R<a.length;++R){const S=a[R];if(!S.da&&S.listener==l&&S.capture==!!d&&S.ha==m)return R}return-1}var $a="closure_lm_"+(Math.random()*1e6|0),ja={};function xl(a,l,d,m,R){if(Array.isArray(l)){for(let S=0;S<l.length;S++)xl(a,l[S],d,m,R);return null}return d=kl(d),a&&a[Nn]?a.J(l,d,c(m)?!!m.capture:!1,R):r_(a,l,d,!1,m,R)}function r_(a,l,d,m,R,S){if(!l)throw Error("Invalid event type");const U=c(R)?!!R.capture:!!R;let Y=Ga(a);if(Y||(a[$a]=Y=new ji(a)),d=Y.add(l,d,m,U,S),d.proxy)return d;if(m=s_(),d.proxy=m,m.src=a,m.listener=d,a.addEventListener)b||(R=U),R===void 0&&(R=!1),a.addEventListener(l.toString(),m,R);else if(a.attachEvent)a.attachEvent(Nl(l.toString()),m);else if(a.addListener&&a.removeListener)a.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return d}function s_(){function a(d){return l.call(a.src,a.listener,d)}const l=i_;return a}function Dl(a,l,d,m,R){if(Array.isArray(l))for(var S=0;S<l.length;S++)Dl(a,l[S],d,m,R);else m=c(m)?!!m.capture:!!m,d=kl(d),a&&a[Nn]?(a=a.i,S=String(l).toString(),S in a.g&&(l=a.g[S],d=qa(l,d,m,R),d>-1&&(qi(l[d]),Array.prototype.splice.call(l,d,1),l.length==0&&(delete a.g[S],a.h--)))):a&&(a=Ga(a))&&(l=a.g[l.toString()],a=-1,l&&(a=qa(l,d,m,R)),(d=a>-1?l[a]:null)&&za(d))}function za(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[Nn])Ba(l.i,a);else{var d=a.type,m=a.proxy;l.removeEventListener?l.removeEventListener(d,m,a.capture):l.detachEvent?l.detachEvent(Nl(d),m):l.addListener&&l.removeListener&&l.removeListener(m),(d=Ga(l))?(Ba(d,a),d.h==0&&(d.src=null,l[$a]=null)):qi(a)}}}function Nl(a){return a in ja?ja[a]:ja[a]="on"+a}function i_(a,l){if(a.da)a=!0;else{l=new ze(l,this);const d=a.listener,m=a.ha||a.src;a.fa&&za(a),a=d.call(m,l)}return a}function Ga(a){return a=a[$a],a instanceof ji?a:null}var Ka="__closure_events_fn_"+(Math.random()*1e9>>>0);function kl(a){return typeof a=="function"?a:(a[Ka]||(a[Ka]=function(l){return a.handleEvent(l)}),a[Ka])}function Ne(){v.call(this),this.i=new ji(this),this.M=this,this.G=null}p(Ne,v),Ne.prototype[Nn]=!0,Ne.prototype.removeEventListener=function(a,l,d,m){Dl(this,a,l,d,m)};function Be(a,l){var d,m=a.G;if(m)for(d=[];m;m=m.G)d.push(m);if(a=a.M,m=l.type||l,typeof l=="string")l=new w(l,a);else if(l instanceof w)l.target=l.target||a;else{var R=l;l=new w(m,a),Cl(l,R)}R=!0;let S,U;if(d)for(U=d.length-1;U>=0;U--)S=l.g=d[U],R=zi(S,m,!0,l)&&R;if(S=l.g=a,R=zi(S,m,!0,l)&&R,R=zi(S,m,!1,l)&&R,d)for(U=0;U<d.length;U++)S=l.g=d[U],R=zi(S,m,!1,l)&&R}Ne.prototype.N=function(){if(Ne.Z.N.call(this),this.i){var a=this.i;for(const l in a.g){const d=a.g[l];for(let m=0;m<d.length;m++)qi(d[m]);delete a.g[l],a.h--}}this.G=null},Ne.prototype.J=function(a,l,d,m){return this.i.add(String(a),l,!1,d,m)},Ne.prototype.K=function(a,l,d,m){return this.i.add(String(a),l,!0,d,m)};function zi(a,l,d,m){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();let R=!0;for(let S=0;S<l.length;++S){const U=l[S];if(U&&!U.da&&U.capture==d){const Y=U.listener,Ie=U.ha||U.src;U.fa&&Ba(a.i,U),R=Y.call(Ie,m)!==!1&&R}}return R&&!m.defaultPrevented}function o_(a,l){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=h(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(l)>2147483647?-1:o.setTimeout(a,l||0)}function Ol(a){a.g=o_(()=>{a.g=null,a.i&&(a.i=!1,Ol(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class a_ extends v{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Ol(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function as(a){v.call(this),this.h=a,this.g={}}p(as,v);var Ll=[];function Ml(a){$i(a.g,function(l,d){this.g.hasOwnProperty(d)&&za(l)},a),a.g={}}as.prototype.N=function(){as.Z.N.call(this),Ml(this)},as.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ha=o.JSON.stringify,c_=o.JSON.parse,u_=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Ul(){}function Fl(){}var cs={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Wa(){w.call(this,"d")}p(Wa,w);function Qa(){w.call(this,"c")}p(Qa,w);var kn={},Bl=null;function Gi(){return Bl=Bl||new Ne}kn.Ia="serverreachability";function ql(a){w.call(this,kn.Ia,a)}p(ql,w);function us(a){const l=Gi();Be(l,new ql(l))}kn.STAT_EVENT="statevent";function $l(a,l){w.call(this,kn.STAT_EVENT,a),this.stat=l}p($l,w);function qe(a){const l=Gi();Be(l,new $l(l,a))}kn.Ja="timingevent";function jl(a,l){w.call(this,kn.Ja,a),this.size=l}p(jl,w);function ls(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},l)}function hs(){this.g=!0}hs.prototype.ua=function(){this.g=!1};function l_(a,l,d,m,R,S){a.info(function(){if(a.g)if(S){var U="",Y=S.split("&");for(let ae=0;ae<Y.length;ae++){var Ie=Y[ae].split("=");if(Ie.length>1){const Re=Ie[0];Ie=Ie[1];const mt=Re.split("_");U=mt.length>=2&&mt[1]=="type"?U+(Re+"="+Ie+"&"):U+(Re+"=redacted&")}}}else U=null;else U=S;return"XMLHTTP REQ ("+m+") [attempt "+R+"]: "+l+`
`+d+`
`+U})}function h_(a,l,d,m,R,S,U){a.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+R+"]: "+l+`
`+d+`
`+S+" "+U})}function Tr(a,l,d,m){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+f_(a,d)+(m?" "+m:"")})}function d_(a,l){a.info(function(){return"TIMEOUT: "+l})}hs.prototype.info=function(){};function f_(a,l){if(!a.g)return l;if(!l)return null;try{const S=JSON.parse(l);if(S){for(a=0;a<S.length;a++)if(Array.isArray(S[a])){var d=S[a];if(!(d.length<2)){var m=d[1];if(Array.isArray(m)&&!(m.length<1)){var R=m[0];if(R!="noop"&&R!="stop"&&R!="close")for(let U=1;U<m.length;U++)m[U]=""}}}}return Ha(S)}catch{return l}}var Ki={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},zl={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Gl;function Ya(){}p(Ya,Ul),Ya.prototype.g=function(){return new XMLHttpRequest},Gl=new Ya;function ds(a){return encodeURIComponent(String(a))}function p_(a){var l=1;a=a.split(":");const d=[];for(;l>0&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function Wt(a,l,d,m){this.j=a,this.i=l,this.l=d,this.S=m||1,this.V=new as(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Kl}function Kl(){this.i=null,this.g="",this.h=!1}var Hl={},Ja={};function Xa(a,l,d){a.M=1,a.A=Wi(pt(l)),a.u=d,a.R=!0,Wl(a,null)}function Wl(a,l){a.F=Date.now(),Hi(a),a.B=pt(a.A);var d=a.B,m=a.S;Array.isArray(m)||(m=[String(m)]),ah(d.i,"t",m),a.C=0,d=a.j.L,a.h=new Kl,a.g=Rh(a.j,d?l:null,!a.u),a.P>0&&(a.O=new a_(h(a.Y,a,a.g),a.P)),l=a.V,d=a.g,m=a.ba;var R="readystatechange";Array.isArray(R)||(R&&(Ll[0]=R.toString()),R=Ll);for(let S=0;S<R.length;S++){const U=xl(d,R[S],m||l.handleEvent,!1,l.h||l);if(!U)break;l.g[U.key]=U}l=a.J?Sl(a.J):{},a.u?(a.v||(a.v="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,l)):(a.v="GET",a.g.ea(a.B,a.v,null,l)),us(),l_(a.i,a.v,a.B,a.l,a.S,a.u)}Wt.prototype.ba=function(a){a=a.target;const l=this.O;l&&Jt(a)==3?l.j():this.Y(a)},Wt.prototype.Y=function(a){try{if(a==this.g)e:{const Y=Jt(this.g),Ie=this.g.ya(),ae=this.g.ca();if(!(Y<3)&&(Y!=3||this.g&&(this.h.h||this.g.la()||ph(this.g)))){this.K||Y!=4||Ie==7||(Ie==8||ae<=0?us(3):us(2)),Za(this);var l=this.g.ca();this.X=l;var d=m_(this);if(this.o=l==200,h_(this.i,this.v,this.B,this.l,this.S,Y,l),this.o){if(this.U&&!this.L){t:{if(this.g){var m,R=this.g;if((m=R.g?R.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(m)){var S=m;break t}}S=null}if(a=S)Tr(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,ec(this,a);else{this.o=!1,this.m=3,qe(12),On(this),fs(this);break e}}if(this.R){a=!0;let Re;for(;!this.K&&this.C<d.length;)if(Re=g_(this,d),Re==Ja){Y==4&&(this.m=4,qe(14),a=!1),Tr(this.i,this.l,null,"[Incomplete Response]");break}else if(Re==Hl){this.m=4,qe(15),Tr(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else Tr(this.i,this.l,Re,null),ec(this,Re);if(Ql(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Y!=4||d.length!=0||this.h.h||(this.m=1,qe(16),a=!1),this.o=this.o&&a,!a)Tr(this.i,this.l,d,"[Invalid Chunked Response]"),On(this),fs(this);else if(d.length>0&&!this.W){this.W=!0;var U=this.j;U.g==this&&U.aa&&!U.P&&(U.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),cc(U),U.P=!0,qe(11))}}else Tr(this.i,this.l,d,null),ec(this,d);Y==4&&On(this),this.o&&!this.K&&(Y==4?Th(this.j,this):(this.o=!1,Hi(this)))}else C_(this.g),l==400&&d.indexOf("Unknown SID")>0?(this.m=3,qe(12)):(this.m=0,qe(13)),On(this),fs(this)}}}catch{}finally{}};function m_(a){if(!Ql(a))return a.g.la();const l=ph(a.g);if(l==="")return"";let d="";const m=l.length,R=Jt(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return On(a),fs(a),"";a.h.i=new o.TextDecoder}for(let S=0;S<m;S++)a.h.h=!0,d+=a.h.i.decode(l[S],{stream:!(R&&S==m-1)});return l.length=0,a.h.g+=d,a.C=0,a.h.g}function Ql(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function g_(a,l){var d=a.C,m=l.indexOf(`
`,d);return m==-1?Ja:(d=Number(l.substring(d,m)),isNaN(d)?Hl:(m+=1,m+d>l.length?Ja:(l=l.slice(m,m+d),a.C=m+d,l)))}Wt.prototype.cancel=function(){this.K=!0,On(this)};function Hi(a){a.T=Date.now()+a.H,Yl(a,a.H)}function Yl(a,l){if(a.D!=null)throw Error("WatchDog timer not null");a.D=ls(h(a.aa,a),l)}function Za(a){a.D&&(o.clearTimeout(a.D),a.D=null)}Wt.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(d_(this.i,this.B),this.M!=2&&(us(),qe(17)),On(this),this.m=2,fs(this)):Yl(this,this.T-a)};function fs(a){a.j.I==0||a.K||Th(a.j,a)}function On(a){Za(a);var l=a.O;l&&typeof l.dispose=="function"&&l.dispose(),a.O=null,Ml(a.V),a.g&&(l=a.g,a.g=null,l.abort(),l.dispose())}function ec(a,l){try{var d=a.j;if(d.I!=0&&(d.g==a||tc(d.h,a))){if(!a.L&&tc(d.h,a)&&d.I==3){try{var m=d.Ba.g.parse(l)}catch{m=null}if(Array.isArray(m)&&m.length==3){var R=m;if(R[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)Zi(d),Ji(d);else break e;ac(d),qe(18)}}else d.xa=R[1],0<d.xa-d.K&&R[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=ls(h(d.Va,d),6e3));Zl(d.h)<=1&&d.ta&&(d.ta=void 0)}else Mn(d,11)}else if((a.L||d.g==a)&&Zi(d),!y(l))for(R=d.Ba.g.parse(l),l=0;l<R.length;l++){let ae=R[l];const Re=ae[0];if(!(Re<=d.K))if(d.K=Re,ae=ae[1],d.I==2)if(ae[0]=="c"){d.M=ae[1],d.ba=ae[2];const mt=ae[3];mt!=null&&(d.ka=mt,d.j.info("VER="+d.ka));const Un=ae[4];Un!=null&&(d.za=Un,d.j.info("SVER="+d.za));const Xt=ae[5];Xt!=null&&typeof Xt=="number"&&Xt>0&&(m=1.5*Xt,d.O=m,d.j.info("backChannelRequestTimeoutMs_="+m)),m=d;const Zt=a.g;if(Zt){const to=Zt.g?Zt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(to){var S=m.h;S.g||to.indexOf("spdy")==-1&&to.indexOf("quic")==-1&&to.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(nc(S,S.h),S.h=null))}if(m.G){const uc=Zt.g?Zt.g.getResponseHeader("X-HTTP-Session-Id"):null;uc&&(m.wa=uc,ue(m.J,m.G,uc))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),m=d;var U=a;if(m.na=Ah(m,m.L?m.ba:null,m.W),U.L){eh(m.h,U);var Y=U,Ie=m.O;Ie&&(Y.H=Ie),Y.D&&(Za(Y),Hi(Y)),m.g=U}else Ih(m);d.i.length>0&&Xi(d)}else ae[0]!="stop"&&ae[0]!="close"||Mn(d,7);else d.I==3&&(ae[0]=="stop"||ae[0]=="close"?ae[0]=="stop"?Mn(d,7):oc(d):ae[0]!="noop"&&d.l&&d.l.qa(ae),d.A=0)}}us(4)}catch{}}var __=class{constructor(a,l){this.g=a,this.map=l}};function Jl(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Xl(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Zl(a){return a.h?1:a.g?a.g.size:0}function tc(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function nc(a,l){a.g?a.g.add(l):a.h=l}function eh(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}Jl.prototype.cancel=function(){if(this.i=th(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function th(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const d of a.g.values())l=l.concat(d.G);return l}return P(a.i)}var nh=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function y_(a,l){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const m=a[d].indexOf("=");let R,S=null;m>=0?(R=a[d].substring(0,m),S=a[d].substring(m+1)):R=a[d],l(R,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function Qt(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let l;a instanceof Qt?(this.l=a.l,ps(this,a.j),this.o=a.o,this.g=a.g,ms(this,a.u),this.h=a.h,rc(this,ch(a.i)),this.m=a.m):a&&(l=String(a).match(nh))?(this.l=!1,ps(this,l[1]||"",!0),this.o=gs(l[2]||""),this.g=gs(l[3]||"",!0),ms(this,l[4]),this.h=gs(l[5]||"",!0),rc(this,l[6]||"",!0),this.m=gs(l[7]||"")):(this.l=!1,this.i=new ys(null,this.l))}Qt.prototype.toString=function(){const a=[];var l=this.j;l&&a.push(_s(l,rh,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(_s(l,rh,!0),"@"),a.push(ds(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(_s(d,d.charAt(0)=="/"?T_:E_,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",_s(d,v_)),a.join("")},Qt.prototype.resolve=function(a){const l=pt(this);let d=!!a.j;d?ps(l,a.j):d=!!a.o,d?l.o=a.o:d=!!a.g,d?l.g=a.g:d=a.u!=null;var m=a.h;if(d)ms(l,a.u);else if(d=!!a.h){if(m.charAt(0)!="/")if(this.g&&!this.h)m="/"+m;else{var R=l.h.lastIndexOf("/");R!=-1&&(m=l.h.slice(0,R+1)+m)}if(R=m,R==".."||R==".")m="";else if(R.indexOf("./")!=-1||R.indexOf("/.")!=-1){m=R.lastIndexOf("/",0)==0,R=R.split("/");const S=[];for(let U=0;U<R.length;){const Y=R[U++];Y=="."?m&&U==R.length&&S.push(""):Y==".."?((S.length>1||S.length==1&&S[0]!="")&&S.pop(),m&&U==R.length&&S.push("")):(S.push(Y),m=!0)}m=S.join("/")}else m=R}return d?l.h=m:d=a.i.toString()!=="",d?rc(l,ch(a.i)):d=!!a.m,d&&(l.m=a.m),l};function pt(a){return new Qt(a)}function ps(a,l,d){a.j=d?gs(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function ms(a,l){if(l){if(l=Number(l),isNaN(l)||l<0)throw Error("Bad port number "+l);a.u=l}else a.u=null}function rc(a,l,d){l instanceof ys?(a.i=l,A_(a.i,a.l)):(d||(l=_s(l,w_)),a.i=new ys(l,a.l))}function ue(a,l,d){a.i.set(l,d)}function Wi(a){return ue(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function gs(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function _s(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,I_),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function I_(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var rh=/[#\/\?@]/g,E_=/[#\?:]/g,T_=/[#\?]/g,w_=/[#\?@]/g,v_=/#/g;function ys(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function Ln(a){a.g||(a.g=new Map,a.h=0,a.i&&y_(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}n=ys.prototype,n.add=function(a,l){Ln(this),this.i=null,a=wr(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function sh(a,l){Ln(a),l=wr(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function ih(a,l){return Ln(a),l=wr(a,l),a.g.has(l)}n.forEach=function(a,l){Ln(this),this.g.forEach(function(d,m){d.forEach(function(R){a.call(l,R,m,this)},this)},this)};function oh(a,l){Ln(a);let d=[];if(typeof l=="string")ih(a,l)&&(d=d.concat(a.g.get(wr(a,l))));else for(a=Array.from(a.g.values()),l=0;l<a.length;l++)d=d.concat(a[l]);return d}n.set=function(a,l){return Ln(this),this.i=null,a=wr(this,a),ih(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},n.get=function(a,l){return a?(a=oh(this,a),a.length>0?String(a[0]):l):l};function ah(a,l,d){sh(a,l),d.length>0&&(a.i=null,a.g.set(wr(a,l),P(d)),a.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(let m=0;m<l.length;m++){var d=l[m];const R=ds(d);d=oh(this,d);for(let S=0;S<d.length;S++){let U=R;d[S]!==""&&(U+="="+ds(d[S])),a.push(U)}}return this.i=a.join("&")};function ch(a){const l=new ys;return l.i=a.i,a.g&&(l.g=new Map(a.g),l.h=a.h),l}function wr(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function A_(a,l){l&&!a.j&&(Ln(a),a.i=null,a.g.forEach(function(d,m){const R=m.toLowerCase();m!=R&&(sh(this,m),ah(this,R,d))},a)),a.j=l}function R_(a,l){const d=new hs;if(o.Image){const m=new Image;m.onload=f(Yt,d,"TestLoadImage: loaded",!0,l,m),m.onerror=f(Yt,d,"TestLoadImage: error",!1,l,m),m.onabort=f(Yt,d,"TestLoadImage: abort",!1,l,m),m.ontimeout=f(Yt,d,"TestLoadImage: timeout",!1,l,m),o.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=a}else l(!1)}function P_(a,l){const d=new hs,m=new AbortController,R=setTimeout(()=>{m.abort(),Yt(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:m.signal}).then(S=>{clearTimeout(R),S.ok?Yt(d,"TestPingServer: ok",!0,l):Yt(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(R),Yt(d,"TestPingServer: error",!1,l)})}function Yt(a,l,d,m,R){try{R&&(R.onload=null,R.onerror=null,R.onabort=null,R.ontimeout=null),m(d)}catch{}}function b_(){this.g=new u_}function sc(a){this.i=a.Sb||null,this.h=a.ab||!1}p(sc,Ul),sc.prototype.g=function(){return new Qi(this.i,this.h)};function Qi(a,l){Ne.call(this),this.H=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(Qi,Ne),n=Qi.prototype,n.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=l,this.readyState=1,Es(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const l={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(l.body=a),(this.H||o).fetch(new Request(this.D,l)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Is(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Es(this)),this.g&&(this.readyState=3,Es(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;uh(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function uh(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.B.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?Is(this):Es(this),this.readyState==3&&uh(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,Is(this))},n.Na=function(a){this.g&&(this.response=a,Is(this))},n.ga=function(){this.g&&Is(this)};function Is(a){a.readyState=4,a.l=null,a.j=null,a.B=null,Es(a)}n.setRequestHeader=function(a,l){this.A.append(a,l)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function Es(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Qi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function lh(a){let l="";return $i(a,function(d,m){l+=m,l+=":",l+=d,l+=`\r
`}),l}function ic(a,l,d){e:{for(m in d){var m=!1;break e}m=!0}m||(d=lh(d),typeof a=="string"?d!=null&&ds(d):ue(a,l,d))}function de(a){Ne.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(de,Ne);var S_=/^https?$/i,V_=["POST","PUT"];n=de.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,l,d,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Gl.g(),this.g.onreadystatechange=g(h(this.Ca,this));try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(S){hh(this,S);return}if(a=d||"",d=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var R in m)d.set(R,m[R]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const S of m.keys())d.set(S,m.get(S));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(d.keys()).find(S=>S.toLowerCase()=="content-type"),R=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(V_,l,void 0)>=0)||m||R||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,U]of d)this.g.setRequestHeader(S,U);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(S){hh(this,S)}};function hh(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.o=5,dh(a),Yi(a)}function dh(a){a.A||(a.A=!0,Be(a,"complete"),Be(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,Be(this,"complete"),Be(this,"abort"),Yi(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Yi(this,!0)),de.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?fh(this):this.Xa())},n.Xa=function(){fh(this)};function fh(a){if(a.h&&typeof i<"u"){if(a.v&&Jt(a)==4)setTimeout(a.Ca.bind(a),0);else if(Be(a,"readystatechange"),Jt(a)==4){a.h=!1;try{const S=a.ca();e:switch(S){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var m;if(m=S===0){let U=String(a.D).match(nh)[1]||null;!U&&o.self&&o.self.location&&(U=o.self.location.protocol.slice(0,-1)),m=!S_.test(U?U.toLowerCase():"")}d=m}if(d)Be(a,"complete"),Be(a,"success");else{a.o=6;try{var R=Jt(a)>2?a.g.statusText:""}catch{R=""}a.l=R+" ["+a.ca()+"]",dh(a)}}finally{Yi(a)}}}}function Yi(a,l){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,l||Be(a,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function Jt(a){return a.g?a.g.readyState:0}n.ca=function(){try{return Jt(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),c_(l)}};function ph(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function C_(a){const l={};a=(a.g&&Jt(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<a.length;m++){if(y(a[m]))continue;var d=p_(a[m]);const R=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const S=l[R]||[];l[R]=S,S.push(d)}n_(l,function(m){return m.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ts(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function mh(a){this.za=0,this.i=[],this.j=new hs,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Ts("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Ts("baseRetryDelayMs",5e3,a),this.Za=Ts("retryDelaySeedMs",1e4,a),this.Ta=Ts("forwardChannelMaxRetries",2,a),this.va=Ts("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new Jl(a&&a.concurrentRequestLimit),this.Ba=new b_,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=mh.prototype,n.ka=8,n.I=1,n.connect=function(a,l,d,m){qe(0),this.W=a,this.H=l||{},d&&m!==void 0&&(this.H.OSID=d,this.H.OAID=m),this.F=this.X,this.J=Ah(this,null,this.W),Xi(this)};function oc(a){if(gh(a),a.I==3){var l=a.V++,d=pt(a.J);if(ue(d,"SID",a.M),ue(d,"RID",l),ue(d,"TYPE","terminate"),ws(a,d),l=new Wt(a,a.j,l),l.M=2,l.A=Wi(pt(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(l.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=l.A,d=!0),d||(l.g=Rh(l.j,null),l.g.ea(l.A)),l.F=Date.now(),Hi(l)}vh(a)}function Ji(a){a.g&&(cc(a),a.g.cancel(),a.g=null)}function gh(a){Ji(a),a.v&&(o.clearTimeout(a.v),a.v=null),Zi(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Xi(a){if(!Xl(a.h)&&!a.m){a.m=!0;var l=a.Ea;J||_(),ee||(J(),ee=!0),E.add(l,a),a.D=0}}function x_(a,l){return Zl(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=l.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=ls(h(a.Ea,a,l),wh(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const R=new Wt(this,this.j,a);let S=this.o;if(this.U&&(S?(S=Sl(S),Cl(S,this.U)):S=this.U),this.u!==null||this.R||(R.J=S,S=null),this.S)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var m=this.i[d];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(l+=m,l>4096){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=yh(this,R,l),d=pt(this.J),ue(d,"RID",a),ue(d,"CVER",22),this.G&&ue(d,"X-HTTP-Session-Id",this.G),ws(this,d),S&&(this.R?l="headers="+ds(lh(S))+"&"+l:this.u&&ic(d,this.u,S)),nc(this.h,R),this.Ra&&ue(d,"TYPE","init"),this.S?(ue(d,"$req",l),ue(d,"SID","null"),R.U=!0,Xa(R,d,null)):Xa(R,d,l),this.I=2}}else this.I==3&&(a?_h(this,a):this.i.length==0||Xl(this.h)||_h(this))};function _h(a,l){var d;l?d=l.l:d=a.V++;const m=pt(a.J);ue(m,"SID",a.M),ue(m,"RID",d),ue(m,"AID",a.K),ws(a,m),a.u&&a.o&&ic(m,a.u,a.o),d=new Wt(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),l&&(a.i=l.G.concat(a.i)),l=yh(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),nc(a.h,d),Xa(d,m,l)}function ws(a,l){a.H&&$i(a.H,function(d,m){ue(l,m,d)}),a.l&&$i({},function(d,m){ue(l,m,d)})}function yh(a,l,d){d=Math.min(a.i.length,d);const m=a.l?h(a.l.Ka,a.l,a):null;e:{var R=a.i;let Y=-1;for(;;){const Ie=["count="+d];Y==-1?d>0?(Y=R[0].g,Ie.push("ofs="+Y)):Y=0:Ie.push("ofs="+Y);let ae=!0;for(let Re=0;Re<d;Re++){var S=R[Re].g;const mt=R[Re].map;if(S-=Y,S<0)Y=Math.max(0,R[Re].g-100),ae=!1;else try{S="req"+S+"_"||"";try{var U=mt instanceof Map?mt:Object.entries(mt);for(const[Un,Xt]of U){let Zt=Xt;c(Xt)&&(Zt=Ha(Xt)),Ie.push(S+Un+"="+encodeURIComponent(Zt))}}catch(Un){throw Ie.push(S+"type="+encodeURIComponent("_badmap")),Un}}catch{m&&m(mt)}}if(ae){U=Ie.join("&");break e}}U=void 0}return a=a.i.splice(0,d),l.G=a,U}function Ih(a){if(!a.g&&!a.v){a.Y=1;var l=a.Da;J||_(),ee||(J(),ee=!0),E.add(l,a),a.A=0}}function ac(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=ls(h(a.Da,a),wh(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,Eh(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=ls(h(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,qe(10),Ji(this),Eh(this))};function cc(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function Eh(a){a.g=new Wt(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var l=pt(a.na);ue(l,"RID","rpc"),ue(l,"SID",a.M),ue(l,"AID",a.K),ue(l,"CI",a.F?"0":"1"),!a.F&&a.ia&&ue(l,"TO",a.ia),ue(l,"TYPE","xmlhttp"),ws(a,l),a.u&&a.o&&ic(l,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=Wi(pt(l)),d.u=null,d.R=!0,Wl(d,a)}n.Va=function(){this.C!=null&&(this.C=null,Ji(this),ac(this),qe(19))};function Zi(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function Th(a,l){var d=null;if(a.g==l){Zi(a),cc(a),a.g=null;var m=2}else if(tc(a.h,l))d=l.G,eh(a.h,l),m=1;else return;if(a.I!=0){if(l.o)if(m==1){d=l.u?l.u.length:0,l=Date.now()-l.F;var R=a.D;m=Gi(),Be(m,new jl(m,d)),Xi(a)}else Ih(a);else if(R=l.m,R==3||R==0&&l.X>0||!(m==1&&x_(a,l)||m==2&&ac(a)))switch(d&&d.length>0&&(l=a.h,l.i=l.i.concat(d)),R){case 1:Mn(a,5);break;case 4:Mn(a,10);break;case 3:Mn(a,6);break;default:Mn(a,2)}}}function wh(a,l){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*l}function Mn(a,l){if(a.j.info("Error code "+l),l==2){var d=h(a.bb,a),m=a.Ua;const R=!m;m=new Qt(m||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||ps(m,"https"),Wi(m),R?R_(m.toString(),d):P_(m.toString(),d)}else qe(2);a.I=0,a.l&&a.l.pa(l),vh(a),gh(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),qe(2)):(this.j.info("Failed to ping google.com"),qe(1))};function vh(a){if(a.I=0,a.ja=[],a.l){const l=th(a.h);(l.length!=0||a.i.length!=0)&&(V(a.ja,l),V(a.ja,a.i),a.h.i.length=0,P(a.i),a.i.length=0),a.l.oa()}}function Ah(a,l,d){var m=d instanceof Qt?pt(d):new Qt(d);if(m.g!="")l&&(m.g=l+"."+m.g),ms(m,m.u);else{var R=o.location;m=R.protocol,l=l?l+"."+R.hostname:R.hostname,R=+R.port;const S=new Qt(null);m&&ps(S,m),l&&(S.g=l),R&&ms(S,R),d&&(S.h=d),m=S}return d=a.G,l=a.wa,d&&l&&ue(m,d,l),ue(m,"VER",a.ka),ws(a,m),m}function Rh(a,l,d){if(l&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Aa&&!a.ma?new de(new sc({ab:d})):new de(a.ma),l.Fa(a.L),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ph(){}n=Ph.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function eo(){}eo.prototype.g=function(a,l){return new Je(a,l)};function Je(a,l){Ne.call(this),this.g=new mh(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.sa&&(a?a["X-WebChannel-Client-Profile"]=l.sa:a={"X-WebChannel-Client-Profile":l.sa}),this.g.U=a,(a=l&&l.Qb)&&!y(a)&&(this.g.u=a),this.A=l&&l.supportsCrossDomainXhr||!1,this.v=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!y(l)&&(this.g.G=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new vr(this)}p(Je,Ne),Je.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Je.prototype.close=function(){oc(this.g)},Je.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=Ha(a),a=d);l.i.push(new __(l.Ya++,a)),l.I==3&&Xi(l)},Je.prototype.N=function(){this.g.l=null,delete this.j,oc(this.g),delete this.g,Je.Z.N.call(this)};function bh(a){Wa.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const d in l){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}p(bh,Wa);function Sh(){Qa.call(this),this.status=1}p(Sh,Qa);function vr(a){this.g=a}p(vr,Ph),vr.prototype.ra=function(){Be(this.g,"a")},vr.prototype.qa=function(a){Be(this.g,new bh(a))},vr.prototype.pa=function(a){Be(this.g,new Sh)},vr.prototype.oa=function(){Be(this.g,"b")},eo.prototype.createWebChannel=eo.prototype.g,Je.prototype.send=Je.prototype.o,Je.prototype.open=Je.prototype.m,Je.prototype.close=Je.prototype.close,Vp=function(){return new eo},Sp=function(){return Gi()},bp=kn,Cc={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Ki.NO_ERROR=0,Ki.TIMEOUT=8,Ki.HTTP_ERROR=6,Io=Ki,zl.COMPLETE="complete",Pp=zl,Fl.EventType=cs,cs.OPEN="a",cs.CLOSE="b",cs.ERROR="c",cs.MESSAGE="d",Ne.prototype.listen=Ne.prototype.J,xs=Fl,de.prototype.listenOnce=de.prototype.K,de.prototype.getLastError=de.prototype.Ha,de.prototype.getLastErrorCode=de.prototype.ya,de.prototype.getStatus=de.prototype.ca,de.prototype.getResponseJson=de.prototype.La,de.prototype.getResponseText=de.prototype.la,de.prototype.send=de.prototype.ea,de.prototype.setWithCredentials=de.prototype.Fa,Rp=de}).apply(typeof ro<"u"?ro:typeof self<"u"?self:typeof window<"u"?window:{});/**
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
 */let ts="12.19.0";function cT(n){ts=n}/**
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
 */const cr=new iu("@firebase/firestore");function xr(){return cr.logLevel}function D(n,...e){if(cr.logLevel<=te.DEBUG){const t=e.map(gu);cr.debug(`Firestore (${ts}): ${n}`,...t)}}function $e(n,...e){if(cr.logLevel<=te.ERROR){const t=e.map(gu);cr.error(`Firestore (${ts}): ${n}`,...t)}}function ct(n,...e){if(cr.logLevel<=te.WARN){const t=e.map(gu);cr.warn(`Firestore (${ts}): ${n}`,...t)}}function gu(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
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
 */function B(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Cp(n,r,t)}function Cp(n,e,t){let r=`FIRESTORE (${ts}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw $e(r),new Error(r)}function O(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Cp(e,s,r)}function W(n,e){return n}/**
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
 */function uT(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */class _u{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=uT(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function H(n,e){return n<e?-1:n>e?1:0}function xc(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const s=n.charAt(r),i=e.charAt(r);if(s!==i)return pc(s)===pc(i)?H(s,i):pc(s)?1:-1}return H(n.length,e.length)}const lT=55296,hT=57343;function pc(n){const e=n.charCodeAt(0);return e>=lT&&e<=hT}function Br(n,e,t){return n.length===e.length&&n.every(((r,s)=>t(r,e[s])))}function xp(n){return n+"\0"}/**
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
 */class le{constructor(e,t){this.comparator=e,this.root=t||Ve.EMPTY}insert(e,t){return new le(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ve.BLACK,null,null))}remove(e){return new le(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ve.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,r)=>(e(t,r),!1)))}toString(){const e=[];return this.inorderTraversal(((t,r)=>(e.push(`${t}:${r}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new so(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new so(this.root,e,this.comparator,!1)}getReverseIterator(){return new so(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new so(this.root,e,this.comparator,!0)}}class so{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ve{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Ve.RED,this.left=s??Ve.EMPTY,this.right=i??Ve.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Ve(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Ve.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Ve.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ve.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ve.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw B(43730,{key:this.key,value:this.value});if(this.right.isRed())throw B(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw B(27949);return e+(this.isRed()?0:1)}}Ve.EMPTY=null,Ve.RED=!0,Ve.BLACK=!1;Ve.EMPTY=new class{constructor(){this.size=0}get key(){throw B(57766)}get value(){throw B(16141)}get color(){throw B(16727)}get left(){throw B(29726)}get right(){throw B(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new Ve(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class ie{constructor(e){this.comparator=e,this.data=new le(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,r)=>(e(t),!1)))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new rd(this.data.getIterator())}getIteratorFrom(e){return new rd(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((r=>{t=t.add(r)})),t}isEqual(e){if(!(e instanceof ie)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new ie(this.comparator);return t.data=e,t}}class rd{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Ar(n){return n.hasNext()?n.getNext():void 0}/**
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
 */const C={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class N extends xt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */const _t="__name__";class gt{constructor(e,t,r){t===void 0?t=0:t>e.length&&B(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&B(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return gt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof gt?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=gt.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return H(e.length,t.length)}static compareSegments(e,t){const r=gt.isNumericId(e),s=gt.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?gt.extractNumericId(e).compare(gt.extractNumericId(t)):xc(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return pn.fromString(e.substring(4,e.length-2))}}class Z extends gt{construct(e,t,r){return new Z(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new N(C.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new Z(t)}static emptyPath(){return new Z([])}}const dT=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Te=class Dr extends gt{construct(e,t,r){return new Dr(e,t,r)}static isValidIdentifier(e){return dT.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Dr.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===_t}static keyField(){return new Dr([_t])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new N(C.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new N(C.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new N(C.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(o=!o,s++):c!=="."||o?(r+=c,s++):(i(),s++)}if(i(),o)throw new N(C.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Dr(t)}static emptyPath(){return new Dr([])}};/**
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
 */class Ke{constructor(e){this.fields=e,e.sort(Te.comparator)}static empty(){return new Ke([])}unionWith(e){let t=new ie(Te.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ke(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Br(this.fields,e.fields,((t,r)=>t.isEqual(r)))}}/**
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
 */function Uo(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function xn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function fT(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Dp(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class F{constructor(e){this.path=e}static fromPath(e){return new F(Z.fromString(e))}static fromName(e){return new F(Z.fromString(e).popFirst(5))}static empty(){return new F(Z.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Z.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Z.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new F(new Z(e.slice()))}}/**
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
 */function Np(n,e,t){if(!t)throw new N(C.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function pT(n,e,t,r){if(e===!0&&r===!0)throw new N(C.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function sd(n){if(!F.isDocumentKey(n))throw new N(C.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function id(n){if(F.isDocumentKey(n))throw new N(C.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function vi(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function ha(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":B(12329,{type:typeof n})}function He(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new N(C.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ha(n);throw new N(C.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */function _e(n,e){const t={typeString:n};return e&&(t.value=e),t}function Ai(n,e){if(!vi(n))throw new N(C.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new N(C.INVALID_ARGUMENT,t);return!0}/**
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
 */const od=-62135596800,ad=1e6;class se{static now(){return se.fromMillis(Date.now())}static fromDate(e){return se.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*ad);return new se(t,r)}static fromInstant(e){if(!e||typeof e.t!="bigint")throw new N(C.INVALID_ARGUMENT,"Invalid Temporal.Instant object provided.");return se._fromEpochNanoseconds(e.t)}static _fromEpochNanoseconds(e){let t,r;if(e>=0n)t=Number(e/1000000000n),r=Number(e%1000000000n);else{const s=e%1000000000n;s===0n?(t=Number(e/1000000000n),r=0):(t=Number(e/1000000000n-1n),r=Number(s+1000000000n))}return new se(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new N(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new N(C.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<od)throw new N(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new N(C.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/ad}toInstant(){if(typeof Temporal>"u"||!Temporal.Instant)throw new N(C.FAILED_PRECONDITION,"The Temporal object is not available in the current environment.");const e=1000000000n*BigInt(this.seconds)+BigInt(this.nanoseconds);return Temporal.Instant.__PRIVATE_fromEpochNanoseconds(e)}_compareTo(e){return this.seconds===e.seconds?H(this.nanoseconds,e.nanoseconds):H(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:se._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Ai(e,se._jsonSchema))return new se(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-od;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}se._jsonSchemaVersion="firestore/timestamp/1.0",se._jsonSchema={type:_e("string",se._jsonSchemaVersion),seconds:_e("number"),nanoseconds:_e("number")};/**
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
 */class kp extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class he{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new kp("Invalid base64 string: "+i):i}})(e);return new he(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new he(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return H(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}he.EMPTY_BYTE_STRING=new he("");const mT=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Bt(n){if(O(!!n,39018),typeof n=="string"){let e=0;const t=mT.exec(n);if(O(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ce(n.seconds),nanos:ce(n.nanos)}}function ce(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function qt(n){return typeof n=="string"?he.fromBase64String(n):he.fromUint8Array(n)}/**
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
 */const Op="server_timestamp",Lp="__type__",Mp="__previous_value__",Up="__local_write_time__";function da(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Lp])==null?void 0:r.stringValue)===Op}function Ri(n){const e=n.mapValue.fields[Mp];return da(e)?Ri(e):e}function qr(n){const e=Bt(n.mapValue.fields[Up].timestampValue);return new se(e.seconds,e.nanos)}/**
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
 */class gT{constructor(e,t,r,s,i,o,c,u,h,f,p,g,P){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f,this.apiKey=p,this._customHeaders=g,this.grpcFlowControlWindow=P}}const Fo="(default)";class ur{constructor(e,t){this.projectId=e,this.database=t||Fo}static empty(){return new ur("","")}get isDefaultDatabase(){return this.database===Fo}isEqual(e){return e instanceof ur&&e.projectId===this.projectId&&e.database===this.database}}function _T(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new N(C.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ur(n.options.projectId,e)}/**
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
 */const Yn=-1;function fa(n){return n==null}function $r(n){return n===0&&1/n==-1/0}function yT(n){return typeof n=="number"&&Number.isInteger(n)&&!$r(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function IT(n){return typeof n=="string"}/**
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
 */const yu="__type__",Fp="__max__",fn={mapValue:{fields:{__type__:{stringValue:Fp}}}},Iu="__vector__",lr="value",At={nullValue:"NULL_VALUE"},Qe={booleanValue:!0},be={booleanValue:!1};function ye(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?da(n)?4:Bp(n)?9007199254740991:hr(n)?10:11:B(28295,{value:n})}function ut(n,e,t){if(n===e)return!0;const r=ye(n);if(r!==ye(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return qr(n).isEqual(qr(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const c=Bt(i.timestampValue),u=Bt(o.timestampValue);return c.seconds===u.seconds&&c.nanos===u.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(i,o){return qt(i.bytesValue).isEqual(qt(o.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(i,o){return ce(i.geoPointValue.latitude)===ce(o.geoPointValue.latitude)&&ce(i.geoPointValue.longitude)===ce(o.geoPointValue.longitude)})(n,e);case 2:return(function(i,o,c){if("integerValue"in i&&"integerValue"in o)return ce(i.integerValue)===ce(o.integerValue);let u,h;if("doubleValue"in i&&"doubleValue"in o)u=ce(i.doubleValue),h=ce(o.doubleValue);else{if(!(c!=null&&c.i))return!1;u=ce(i.integerValue??i.doubleValue),h=ce(o.integerValue??o.doubleValue)}return u===h?!!(c!=null&&c.o)||$r(u)===$r(h):!!(c===void 0||c.u)&&isNaN(u)&&isNaN(h)})(n,e,t);case 9:return Br(n.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>ut(s,i,t)));case 10:case 11:return(function(i,o,c){const u=i.mapValue.fields||{},h=o.mapValue.fields||{};if(Uo(u)!==Uo(h))return!1;for(const f in u)if(u.hasOwnProperty(f)&&(h[f]===void 0||!ut(u[f],h[f],c)))return!1;return!0})(n,e,t);default:return B(52216,{left:n})}}function Xs(n,e){return(n.values||[]).find((t=>ut(t,e)))!==void 0}function Ue(n,e){if(n===e)return 0;const t=ye(n),r=ye(e);if(t!==r)return H(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return H(n.booleanValue,e.booleanValue);case 2:return(function(i,o){const c=ce(i.integerValue||i.doubleValue),u=ce(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1})(n,e);case 3:return cd(n.timestampValue,e.timestampValue);case 4:return cd(qr(n),qr(e));case 5:return xc(n.stringValue,e.stringValue);case 6:return(function(i,o){const c=qt(i),u=qt(o);return c.compareTo(u)})(n.bytesValue,e.bytesValue);case 7:return(function(i,o){const c=i.split("/"),u=o.split("/");for(let h=0;h<c.length&&h<u.length;h++){const f=H(c[h],u[h]);if(f!==0)return f}return H(c.length,u.length)})(n.referenceValue,e.referenceValue);case 8:return(function(i,o){const c=H(ce(i.latitude),ce(o.latitude));return c!==0?c:H(ce(i.longitude),ce(o.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return ud(n.arrayValue,e.arrayValue);case 10:return(function(i,o){var g,P,V,L;const c=i.fields||{},u=o.fields||{},h=(g=c[lr])==null?void 0:g.arrayValue,f=(P=u[lr])==null?void 0:P.arrayValue,p=H(((V=h==null?void 0:h.values)==null?void 0:V.length)||0,((L=f==null?void 0:f.values)==null?void 0:L.length)||0);return p!==0?p:ud(h,f)})(n.mapValue,e.mapValue);case 11:return(function(i,o){if(i===fn.mapValue&&o===fn.mapValue)return 0;if(i===fn.mapValue)return 1;if(o===fn.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let p=0;p<u.length&&p<f.length;++p){const g=xc(u[p],f[p]);if(g!==0)return g;const P=Ue(c[u[p]],h[f[p]]);if(P!==0)return P}return H(u.length,f.length)})(n.mapValue,e.mapValue);default:throw B(23264,{l:t})}}function cd(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return H(n,e);const t=Bt(n),r=Bt(e),s=H(t.seconds,r.seconds);return s!==0?s:H(t.nanos,r.nanos)}function ud(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Ue(t[s],r[s]);if(i!==void 0&&i!==0)return i}return H(t.length,r.length)}function jr(n){return Dc(n)}function Dc(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const r=Bt(t);return`time(${r.seconds},${r.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return qt(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return F.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=Dc(i);return r+"]"})(n.arrayValue):"mapValue"in n?(function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${Dc(t.fields[o])}`;return s+"}"})(n.mapValue):B(61005,{value:n})}function Eo(n){switch(ye(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Ri(n);return e?16+Eo(e):16;case 5:return 2*n.stringValue.length;case 6:return qt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(r){return(r.values||[]).reduce(((s,i)=>s+Eo(i)),0)})(n.arrayValue);case 10:case 11:return(function(r){let s=0;return xn(r.fields,((i,o)=>{s+=i.length+Eo(o)})),s})(n.mapValue);default:throw B(13486,{value:n})}}function Zs(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function yt(n){return!!n&&"integerValue"in n}function Hn(n){return!!n&&"doubleValue"in n}function En(n){return yt(n)||Hn(n)}function Tn(n){return!!n&&"arrayValue"in n}function et(n){return!!n&&"nullValue"in n}function Ye(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Jn(n){return!!n&&"mapValue"in n}function hr(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[yu])==null?void 0:r.stringValue)===Iu}function Nc(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[lr])==null?void 0:t.arrayValue}function Ms(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return xn(n.mapValue.fields,((t,r)=>e.mapValue.fields[t]=Ms(r))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ms(n.arrayValue.values[t]);return e}return{...n}}function Bp(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Fp}const qp={mapValue:{fields:{[yu]:{stringValue:Iu},[lr]:{arrayValue:{}}}}};function ET(n){return"nullValue"in n?At:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?Zs(ur.empty(),F.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?hr(n)?qp:{mapValue:{}}:B(35942,{value:n})}function TT(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?Zs(ur.empty(),F.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?qp:"mapValue"in n?hr(n)?{mapValue:{}}:fn:B(61959,{value:n})}function ld(n,e){const t=Ue(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function hd(n,e){const t=Ue(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
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
 */class xe{constructor(e){this.value=e}static empty(){return new xe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Jn(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ms(t)}setAll(e){let t=Te.emptyPath(),r={},s=[];e.forEach(((o,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}o?r[c.lastSegment()]=Ms(o):s.push(c.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Jn(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ut(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Jn(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){xn(t,((s,i)=>e[s]=i));for(const s of r)delete e[s]}clone(){return new xe(Ms(this.value))}}function $p(n){const e=[];return xn(n.fields,((t,r)=>{const s=new Te([t]);if(Jn(r)){const i=$p(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new Ke(e)}/**
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
 */function pa(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:$r(e)?"-0":e}}function Eu(n){return{integerValue:""+n}}function ma(n,e,t){return yT(e)?Eu(e):pa(n,e)}/**
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
 */class ga{constructor(){this._=void 0}}function wT(n,e,t){return n instanceof zr?(function(s,i){const o={fields:{[Lp]:{stringValue:Op},[Up]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&da(i)&&(i=Ri(i)),i&&(o.fields[Mp]=i),{mapValue:o}})(t,e):n instanceof Gr?zp(n,e):n instanceof Kr?Gp(n,e):n instanceof dr?(function(s,i){const o=jp(s,i),c=Bo(o)+Bo(s.h);return yt(o)&&yt(s.h)?Eu(c):pa(s.serializer,c)})(n,e):n instanceof ei?(function(s,i){return dd(s,i,Math.min)})(n,e):n instanceof ti?(function(s,i){return dd(s,i,Math.max)})(n,e):void 0}function vT(n,e,t){return n instanceof Gr?zp(n,e):n instanceof Kr?Gp(n,e):t}function jp(n,e){return n instanceof dr?En(e)?e:{integerValue:0}:null}class zr extends ga{}class Gr extends ga{constructor(e){super(),this.elements=e}}function zp(n,e){const t=Kp(e);for(const r of n.elements)t.some((s=>ut(s,r)))||t.push(r);return{arrayValue:{values:t}}}class Kr extends ga{constructor(e){super(),this.elements=e}}function Gp(n,e){let t=Kp(e);for(const r of n.elements)t=t.filter((s=>!ut(s,r)));return{arrayValue:{values:t}}}class Tu extends ga{constructor(e,t){super(),this.serializer=e,this.h=t}}class dr extends Tu{}class ei extends Tu{}class ti extends Tu{}function dd(n,e,t){if(!En(e))return n.h;const r=t(Bo(e),Bo(n.h));return yt(e)&&yt(n.h)?Eu(r):pa(n.serializer,r)}function Bo(n){return ce(n.integerValue||n.doubleValue)}function Kp(n){return Tn(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
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
 */class wu{constructor(e,t){this.field=e,this.transform=t}}function AT(n,e){return n.field.isEqual(e.field)&&(function(r,s){return r instanceof Gr&&s instanceof Gr||r instanceof Kr&&s instanceof Kr?Br(r.elements,s.elements,ut):r instanceof dr&&s instanceof dr||r instanceof ei&&s instanceof ei||r instanceof ti&&s instanceof ti?ut(r.h,s.h):r instanceof zr&&s instanceof zr})(n.transform,e.transform)}class RT{constructor(e,t){this.version=e,this.transformResults=t}}class Se{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Se}static exists(e){return new Se(void 0,e)}static updateTime(e){return new Se(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function To(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class _a{}function Hp(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Pi(n.key,Se.none()):new ns(n.key,n.data,Se.none());{const t=n.data,r=xe.empty();let s=new ie(Te.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new Gt(n.key,r,new Ke(s.toArray()),Se.none())}}function PT(n,e,t){n instanceof ns?(function(s,i,o){const c=s.value.clone(),u=pd(s.fieldTransforms,i,o.transformResults);c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(n,e,t):n instanceof Gt?(function(s,i,o){if(!To(s.precondition,i))return void i.convertToUnknownDocument(o.version);const c=pd(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(Wp(s)),u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()})(n,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Us(n,e,t,r){return n instanceof ns?(function(i,o,c,u){if(!To(i.precondition,o))return c;const h=i.value.clone(),f=md(i.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null})(n,e,t,r):n instanceof Gt?(function(i,o,c,u){if(!To(i.precondition,o))return c;const h=md(i.fieldTransforms,u,o),f=o.data;return f.setAll(Wp(i)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((p=>p.field)))})(n,e,t,r):(function(i,o,c){return To(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c})(n,e,t)}function bT(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=jp(r.transform,s||null);i!=null&&(t===null&&(t=xe.empty()),t.set(r.field,i))}return t||null}function fd(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Br(r,s,((i,o)=>AT(i,o)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class ns extends _a{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Gt extends _a{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Wp(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}})),e}function pd(n,e,t){const r=new Map;O(n.length===t.length,32656,{T:t.length,P:n.length});for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,c=e.data.field(i.field);r.set(i.field,vT(o,c,t[s]))}return r}function md(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,wT(i,o,e))}return r}class Pi extends _a{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Qp extends _a{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class Hr{constructor(e,t){this.position=e,this.inclusive=t}}function gd(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=F.comparator(F.fromName(o.referenceValue),t.key):r=Ue(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function _d(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!ut(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Yp{}class ne extends Yp{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new ST(e,t,r):t==="array-contains"?new xT(e,r):t==="in"?new nm(e,r):t==="not-in"?new DT(e,r):t==="array-contains-any"?new NT(e,r):new ne(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new VT(e,r):new CT(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Ue(t,this.value)):t!==null&&ye(this.value)===ye(t)&&this.matchesComparison(Ue(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return B(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class oe extends Yp{constructor(e,t){super(),this.filters=e,this.op=t,this.I=null}static create(e,t){return new oe(e,t)}matches(e){return Wr(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.I!==null||(this.I=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.I}getFilters(){return Object.assign([],this.filters)}}function Wr(n){return n.op==="and"}function kc(n){return n.op==="or"}function vu(n){return Jp(n)&&Wr(n)}function Jp(n){for(const e of n.filters)if(e instanceof oe)return!1;return!0}function Oc(n){if(n instanceof ne)return n.field.canonicalString()+n.op.toString()+jr(n.value);if(vu(n))return n.filters.map((e=>Oc(e))).join(",");{const e=n.filters.map((t=>Oc(t))).join(",");return`${n.op}(${e})`}}function Xp(n,e){return n instanceof ne?(function(r,s){return s instanceof ne&&r.op===s.op&&r.field.isEqual(s.field)&&ut(r.value,s.value)})(n,e):n instanceof oe?(function(r,s){return s instanceof oe&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce(((i,o,c)=>i&&Xp(o,s.filters[c])),!0):!1})(n,e):void B(19439)}function Zp(n,e){const t=n.filters.concat(e);return oe.create(t,n.op)}function em(n){return n instanceof ne?(function(t){return`${t.field.canonicalString()} ${t.op} ${jr(t.value)}`})(n):n instanceof oe?(function(t){return t.op.toString()+" {"+t.getFilters().map(em).join(" ,")+"}"})(n):"Filter"}class ST extends ne{constructor(e,t,r){super(e,t,r),this.key=F.fromName(r.referenceValue)}matches(e){const t=F.comparator(e.key,this.key);return this.matchesComparison(t)}}class VT extends ne{constructor(e,t){super(e,"in",t),this.keys=tm("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class CT extends ne{constructor(e,t){super(e,"not-in",t),this.keys=tm("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function tm(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((r=>F.fromName(r.referenceValue)))}class xT extends ne{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Tn(t)&&Xs(t.arrayValue,this.value)}}class nm extends ne{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Xs(this.value.arrayValue,t)}}class DT extends ne{constructor(e,t){super(e,"not-in",t)}matches(e){if(Xs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Xs(this.value.arrayValue,t)}}class NT extends ne{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Tn(t)||!t.arrayValue.values)&&t.arrayValue.values.some((r=>Xs(this.value.arrayValue,r)))}}/**
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
 */class ni{constructor(e,t="asc"){this.field=e,this.dir=t}}function kT(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class q{static fromTimestamp(e){return new q(e)}static min(){return new q(new se(0,0))}static max(){return new q(new se(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class fe{constructor(e,t,r,s,i,o,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new fe(e,0,q.min(),q.min(),q.min(),xe.empty(),0)}static newFoundDocument(e,t,r,s){return new fe(e,1,t,q.min(),r,s,0)}static newNoDocument(e,t){return new fe(e,2,t,q.min(),q.min(),xe.empty(),0)}static newUnknownDocument(e,t){return new fe(e,3,t,q.min(),q.min(),xe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(q.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=xe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=xe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=q.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof fe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new fe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */const ri=-1;class qo{constructor(e,t,r,s){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=s}}function Lc(n){return n.fields.find((e=>e.kind===2))}function Bn(n){return n.fields.filter((e=>e.kind!==2))}qo.UNKNOWN_ID=-1;class wo{constructor(e,t){this.fieldPath=e,this.kind=t}}class si{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new si(0,tt.min())}}function OT(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=q.fromTimestamp(r===1e9?new se(t+1,0):new se(t,r));return new tt(s,F.empty(),e)}function rm(n){return new tt(n.readTime,n.key,ri)}class tt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new tt(q.min(),F.empty(),ri)}static max(){return new tt(q.max(),F.empty(),ri)}}function Au(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=F.comparator(n.documentKey,e.documentKey),t!==0?t:H(n.largestBatchId,e.largestBatchId))}/**
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
 */class LT{constructor(e,t=null,r=[],s=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=c,this.R=null}}function Mc(n,e=null,t=[],r=[],s=null,i=null,o=null){return new LT(n,e,t,r,s,i,o)}function $o(n){const e=W(n);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((r=>Oc(r))).join(","),t+="|ob:",t+=e.orderBy.map((r=>(function(i){return i.field.canonicalString()+i.dir})(r))).join(","),fa(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((r=>jr(r))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((r=>jr(r))).join(",")),e.R=t}return e.R}function Ru(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!kT(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Xp(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!_d(n.startAt,e.startAt)&&_d(n.endAt,e.endAt)}function hn(n){return!!n.isCorePipeline}function Pu(n){return!!n.path&&F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function jo(n,e){return n.filters.filter((t=>t instanceof ne&&t.field.isEqual(e)))}function yd(n,e,t){let r=At,s=!0;for(const i of jo(n,e)){let o=At,c=!0;switch(i.op){case"<":case"<=":o=ET(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,c=!1;break;case"!=":case"not-in":o=At}ld({value:r,inclusive:s},{value:o,inclusive:c})<0&&(r=o,s=c)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];ld({value:r,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}function Id(n,e,t){let r=fn,s=!0;for(const i of jo(n,e)){let o=fn,c=!0;switch(i.op){case">=":case">":o=TT(i.value),c=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,c=!1;break;case"!=":case"not-in":o=fn}hd({value:r,inclusive:s},{value:o,inclusive:c})>0&&(r=o,s=c)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];hd({value:r,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}/**
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
 */class rs{constructor(e,t=null,r=[],s=[],i=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=u,this.A=null,this.V=null,this.m=null,this.startAt,this.endAt}}function MT(n,e,t,r,s,i,o,c){return new rs(n,e,t,r,s,i,o,c)}function bi(n){return new rs(n)}function Ed(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function UT(n){return F.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function sm(n){return n.collectionGroup!==null}function Fs(n){const e=W(n);if(e.A===null){e.A=[];const t=new Set;for(const i of e.explicitOrderBy)e.A.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new ie(Te.comparator);return o.filters.forEach((u=>{u.getFlattenedFilters().forEach((h=>{h.isInequality()&&(c=c.add(h.field))}))})),c})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.A.push(new ni(i,r))})),t.has(Te.keyField().canonicalString())||e.A.push(new ni(Te.keyField(),r))}return e.A}function ot(n){const e=W(n);return e.V||(e.V=FT(e,Fs(n))),e.V}function FT(n,e){if(n.limitType==="F")return Mc(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new ni(s.field,i)}));const t=n.endAt?new Hr(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Hr(n.startAt.position,n.startAt.inclusive):null;return Mc(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Uc(n,e){const t=n.filters.concat([e]);return new rs(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function BT(n,e){const t=n.explicitOrderBy.concat([e]);return new rs(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function zo(n,e,t){return new rs(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function qT(n,e){return Ru(ot(n),ot(e))&&n.limitType===e.limitType}function Bs(n){return`Query(target=${(function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map((s=>em(s))).join(", ")}]`),fa(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map((s=>jr(s))).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map((s=>jr(s))).join(",")),`Target(${r})`})(ot(n))}; limitType=${n.limitType})`}function ya(n,e){return e.isFoundDocument()&&(function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):F.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)})(n,e)&&(function(r,s){for(const i of Fs(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0})(n,e)&&(function(r,s){return!(r.startAt&&!(function(o,c,u){const h=gd(o,c,u);return o.inclusive?h<=0:h<0})(r.startAt,Fs(r),s)||r.endAt&&!(function(o,c,u){const h=gd(o,c,u);return o.inclusive?h>=0:h>0})(r.endAt,Fs(r),s))})(n,e)}function bu(n){return(e,t)=>{let r=!1;for(const s of Fs(n)){const i=$T(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function $T(n,e,t){const r=n.field.isKeyField()?F.comparator(e.key,t.key):(function(i,o,c){const u=o.data.field(i),h=c.data.field(i);return u!==null&&h!==null?Ue(u,h):B(42886)})(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return B(19790,{direction:n.dir})}}/**
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
 */class jT{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var me,re;function zT(n){switch(n){case C.OK:return B(64938);case C.CANCELLED:case C.UNKNOWN:case C.DEADLINE_EXCEEDED:case C.RESOURCE_EXHAUSTED:case C.INTERNAL:case C.UNAVAILABLE:case C.UNAUTHENTICATED:return!1;case C.INVALID_ARGUMENT:case C.NOT_FOUND:case C.ALREADY_EXISTS:case C.PERMISSION_DENIED:case C.FAILED_PRECONDITION:case C.ABORTED:case C.OUT_OF_RANGE:case C.UNIMPLEMENTED:case C.DATA_LOSS:return!0;default:return B(15467,{code:n})}}function im(n){if(n===void 0)return $e("GRPC error has no .code"),C.UNKNOWN;switch(n){case me.OK:return C.OK;case me.CANCELLED:return C.CANCELLED;case me.UNKNOWN:return C.UNKNOWN;case me.DEADLINE_EXCEEDED:return C.DEADLINE_EXCEEDED;case me.RESOURCE_EXHAUSTED:return C.RESOURCE_EXHAUSTED;case me.INTERNAL:return C.INTERNAL;case me.UNAVAILABLE:return C.UNAVAILABLE;case me.UNAUTHENTICATED:return C.UNAUTHENTICATED;case me.INVALID_ARGUMENT:return C.INVALID_ARGUMENT;case me.NOT_FOUND:return C.NOT_FOUND;case me.ALREADY_EXISTS:return C.ALREADY_EXISTS;case me.PERMISSION_DENIED:return C.PERMISSION_DENIED;case me.FAILED_PRECONDITION:return C.FAILED_PRECONDITION;case me.ABORTED:return C.ABORTED;case me.OUT_OF_RANGE:return C.OUT_OF_RANGE;case me.UNIMPLEMENTED:return C.UNIMPLEMENTED;case me.DATA_LOSS:return C.DATA_LOSS;default:return B(39323,{code:n})}}(re=me||(me={}))[re.OK=0]="OK",re[re.CANCELLED=1]="CANCELLED",re[re.UNKNOWN=2]="UNKNOWN",re[re.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",re[re.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",re[re.NOT_FOUND=5]="NOT_FOUND",re[re.ALREADY_EXISTS=6]="ALREADY_EXISTS",re[re.PERMISSION_DENIED=7]="PERMISSION_DENIED",re[re.UNAUTHENTICATED=16]="UNAUTHENTICATED",re[re.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",re[re.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",re[re.ABORTED=10]="ABORTED",re[re.OUT_OF_RANGE=11]="OUT_OF_RANGE",re[re.UNIMPLEMENTED=12]="UNIMPLEMENTED",re[re.INTERNAL=13]="INTERNAL",re[re.UNAVAILABLE=14]="UNAVAILABLE",re[re.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class Kt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){xn(this.inner,((t,r)=>{for(const[s,i]of r)e(s,i)}))}isEmpty(){return Dp(this.inner)}size(){return this.innerSize}}/**
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
 */const GT=new le(F.comparator);function Ee(){return GT}const om=new le(F.comparator);function Nr(...n){let e=om;for(const t of n)e=e.insert(t.key,t);return e}function am(n){let e=om;return n.forEach(((t,r)=>e=e.insert(t,r.overlayedDocument))),e}function rt(){return qs()}function cm(){return qs()}function qs(){return new Kt((n=>n.toString()),((n,e)=>n.isEqual(e)))}const KT=new le(F.comparator),HT=new ie(F.comparator);function Q(...n){let e=HT;for(const t of n)e=e.add(t);return e}const WT=new ie(H);function QT(){return WT}/**
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
 */function YT(){return new TextEncoder}/**
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
 */const JT=new pn([4294967295,4294967295],0);function Td(n){const e=YT().encode(n),t=new Ap;return t.update(e),new Uint8Array(t.digest())}function wd(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new pn([t,r],0),new pn([s,i],0)]}class Su{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ds(`Invalid padding: ${t}`);if(r<0)throw new Ds(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ds(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ds(`Invalid padding when bitmap length is 0: ${t}`);this.p=8*e.length-t,this.S=pn.fromNumber(this.p)}v(e,t,r){let s=e.add(t.multiply(pn.fromNumber(r)));return s.compare(JT)===1&&(s=new pn([s.getBits(0),s.getBits(1)],0)),s.modulo(this.S).toNumber()}D(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.p===0)return!1;const t=Td(e),[r,s]=wd(t);for(let i=0;i<this.hashCount;i++){const o=this.v(r,s,i);if(!this.D(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Su(i,s,t);return r.forEach((c=>o.insert(c))),o}insert(e){if(this.p===0)return;const t=Td(e),[r,s]=wd(t);for(let i=0;i<this.hashCount;i++){const o=this.v(r,s,i);this.C(o)}}C(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ds extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Si{constructor(e,t,r,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Vi.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Si(q.min(),s,new le(H),Ee(),Ee(),Q())}}class Vi{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Vi(r,t,Q(),Q(),Q())}}/**
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
 */class vo{constructor(e,t,r,s){this.F=e,this.removedTargetIds=t,this.key=r,this.O=s}}class um{constructor(e,t){this.targetId=e,this.M=t}}class lm{constructor(e,t,r=he.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class vd{constructor(e){this.targetId=e,this.N=0,this.L=Ad(),this.B=he.EMPTY_BYTE_STRING,this.U=!1,this.k=!0}get current(){return this.U}get resumeToken(){return this.B}get q(){return this.N!==0}get $(){return this.k}K(e){e.approximateByteSize()>0&&(this.k=!0,this.B=e)}W(){let e=Q(),t=Q(),r=Q();return this.L.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:B(38017,{changeType:i})}})),new Vi(this.B,this.U,e,t,r)}G(){this.k=!1,this.L=Ad()}j(e,t){this.k=!0,this.L=this.L.insert(e,t)}H(e){this.k=!0,this.L=this.L.remove(e)}J(){this.N+=1}Y(){this.N-=1,O(this.N>=0,3241,{N:this.N,targetId:this.targetId})}Z(){this.k=!0,this.U=!0}}const vs="WatchChangeAggregator";class XT{constructor(e){this.X=e,this.ee=new Map,this.te=Ee(),this.ne=io(),this.re=Ee(),this.ie=io(),this.se=new le(H)}_e(e){for(const t of e.F)e.O&&e.O.isFoundDocument()?this.oe(t,e.O):this.ae(t,e.key,e.O);for(const t of e.removedTargetIds)this.ae(t,e.key,e.O)}ue(e){this.forEachTarget(e,(t=>{const r=this.ee.get(t);if(r)switch(e.state){case 0:this.ce(t)&&r.K(e.resumeToken);break;case 1:r.Y(),r.q||r.G(),r.K(e.resumeToken);break;case 2:r.Y(),r.q||this.removeTarget(t);break;case 3:this.ce(t)&&(r.Z(),r.K(e.resumeToken));break;case 4:this.ce(t)&&(this.le(t),r.K(e.resumeToken));break;default:B(56790,{state:e.state})}else D(vs,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ee.forEach(((r,s)=>{this.ce(s)&&t(s)}))}Ee(e){var t;return hn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:Pu(e)}he(e){const t=e.targetId,r=e.M.count,s=this.Te(t);if(s){const i=s.target;if(this.Ee(i))if(r===0){const o=new F(hn(i)?Z.fromString(i.getPipelineDocuments()[0]):i.path);this.ae(t,o,fe.newNoDocument(o,q.min()))}else O(r===1,20013,"Single document existence filter with count: "+r);else{const o=this.Pe(t);if(o!==r){const c=this.Ie(e),u=c?this.Re(c,e,o):1;if(u!==0){this.le(t);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.se=this.se.insert(t,h)}}}}}Ie(e){const t=e.M.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,c;try{o=qt(r).toUint8Array()}catch(u){if(u instanceof kp)return ct("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new Su(o,s,i)}catch(u){return ct(u instanceof Ds?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.p===0?null:c}Re(e,t,r){return t.M.count===r-this.de(e,t.targetId)?0:2}de(e,t){const r=this.X.getRemoteKeysForTarget(t);let s=0;return r.forEach((i=>{const o=this.X.Ve(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.ae(t,i,null),s++)})),s}fe(e){const t=new Map;this.ee.forEach(((i,o)=>{const c=this.Te(o);if(c){if(i.current&&this.Ee(c.target)){const u=hn(c.target)?Z.fromString(c.target.getPipelineDocuments()[0]):c.target.path,h=new F(u);this.me(h).has(o)||this.pe(o,h)||this.ae(o,h,fe.newNoDocument(h,e))}i.$&&(t.set(o,i.W()),i.G())}}));let r=Q();this.ie.forEach(((i,o)=>{let c=!0;o.forEachWhile((u=>{const h=this.Te(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(r=r.add(i))})),this.te.forEach(((i,o)=>o.setReadTime(e))),this.re.forEach(((i,o)=>o.setReadTime(e)));const s=new Si(e,t,this.se,this.te,this.re,r);return this.te=Ee(),this.ne=io(),this.re=Ee(),this.ie=io(),this.se=new le(H),s}oe(e,t){const r=this.ee.get(e);if(!r||!this.ce(e))return void D(vs,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.pe(e,t.key)?2:0;r.j(t.key,s),hn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t.key,t):this.te=this.te.insert(t.key,t),this.ne=this.ne.insert(t.key,this.me(t.key).add(e)),this.ie=this.ie.insert(t.key,this.ge(t.key).add(e))}ae(e,t,r){const s=this.ee.get(e);s&&this.ce(e)?(this.pe(e,t)?s.j(t,1):s.H(t),this.ie=this.ie.insert(t,this.ge(t).delete(e)),this.ie=this.ie.insert(t,this.ge(t).add(e)),r&&(hn(this.Te(e).target)&&this.Te(e).target.getPipelineFlavor()!=="exact"?this.re=this.re.insert(t,r):this.te=this.te.insert(t,r))):D(vs,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.ee.delete(e)}Pe(e){const t=this.ee.get(e);if(!t)return 0;const r=t.W();return this.X.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}J(e){let t=this.ee.get(e);t||(D(vs,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new vd(e),this.ee.set(e,t)),t.J()}ge(e){let t=this.ie.get(e);return t||(t=new ie(H),this.ie=this.ie.insert(e,t)),t}me(e){let t=this.ne.get(e);return t||(t=new ie(H),this.ne=this.ne.insert(e,t)),t}ce(e){const t=this.Te(e)!==null;return t||D(vs,"Detected inactive target",e),t}Te(e){const t=this.ee.get(e);return t===void 0||t.q?null:this.X.ye(e)}le(e){this.ee.set(e,new vd(e)),this.X.getRemoteKeysForTarget(e).forEach((t=>{this.ae(e,t,null)}))}pe(e,t){return this.X.getRemoteKeysForTarget(e).has(t)}}function io(){return new le(F.comparator)}function Ad(){return new le(F.comparator)}const ZT={asc:"ASCENDING",desc:"DESCENDING"},ew={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},tw={and:"AND",or:"OR"};class nw{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Fc(n,e){return n.useProto3Json||fa(e)?e:{value:e}}function Xn(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Vu(n){const e=Bt(n);return new se(e.seconds,e.nanos)}function hm(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Ao(n,e){return Xn(n,e.toTimestamp())}function je(n){return O(!!n,49232),q.fromTimestamp(Vu(n))}function Cu(n,e){return Bc(n,e).canonicalString()}function Bc(n,e){const t=(function(s){return new Z(["projects",s.projectId,"databases",s.database])})(n).child("documents");return e===void 0?t:t.child(e)}function dm(n){const e=Z.fromString(n);return O(wm(e),10190,{key:e.toString()}),e}function ii(n,e){return Cu(n.databaseId,e.path)}function Zn(n,e){const t=dm(e);if(t.get(1)!==n.databaseId.projectId)throw new N(C.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new N(C.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new F(mm(t))}function fm(n,e){return Cu(n.databaseId,e)}function pm(n){const e=dm(n);return e.length===4?Z.emptyPath():mm(e)}function qc(n){return new Z(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function mm(n){return O(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Rd(n,e,t){return{name:ii(n,e),fields:t.value.mapValue.fields}}function rw(n,e,t){const r=Zn(n,e.name),s=je(e.updateTime),i=e.createTime?je(e.createTime):q.min(),o=new xe({mapValue:{fields:e.fields}}),c=fe.newFoundDocument(r,s,i,o);return t&&c.setHasCommittedMutations(),t?c.setHasCommittedMutations():c}function sw(n,e){let t;if("targetChange"in e){e.targetChange;const r=(function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:B(39313,{state:h})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(h,f){return h.useProto3Json?(O(f===void 0||typeof f=="string",58123),he.fromBase64String(f||"")):(O(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),he.fromUint8Array(f||new Uint8Array))})(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&(function(h){const f=h.code===void 0?C.UNKNOWN:im(h.code);return new N(f,h.message||"")})(o);t=new lm(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Zn(n,r.document.name),i=je(r.document.updateTime),o=r.document.createTime?je(r.document.createTime):q.min(),c=new xe({mapValue:{fields:r.document.fields}}),u=fe.newFoundDocument(s,i,o,c),h=r.targetIds||[],f=r.removedTargetIds||[];t=new vo(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Zn(n,r.document),i=r.readTime?je(r.readTime):q.min(),o=fe.newNoDocument(s,i),c=r.removedTargetIds||[];t=new vo([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Zn(n,r.document),i=r.removedTargetIds||[];t=new vo([],i,s,null)}else{if(!("filter"in e))return B(11601,{we:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new jT(s,i),c=r.targetId;t=new um(c,o)}}return t}function Go(n,e){let t;if(e instanceof ns)t={update:Rd(n,e.key,e.value)};else if(e instanceof Pi)t={delete:ii(n,e.key)};else if(e instanceof Gt)t={update:Rd(n,e.key,e.data),updateMask:lw(e.fieldMask)};else{if(!(e instanceof Qp))return B(16599,{be:e.type});t={verify:ii(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((r=>(function(i,o){const c=o.transform;if(c instanceof zr)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Gr)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Kr)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof dr)return{fieldPath:o.field.canonicalString(),increment:c.h};if(c instanceof ei)return{fieldPath:o.field.canonicalString(),minimum:c.h};if(c instanceof ti)return{fieldPath:o.field.canonicalString(),maximum:c.h};throw B(20930,{transform:o.transform})})(0,r)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:Ao(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:B(27497)})(n,e.precondition)),t}function $c(n,e){const t=e.currentDocument?(function(i){return i.updateTime!==void 0?Se.updateTime(je(i.updateTime)):i.exists!==void 0?Se.exists(i.exists):Se.none()})(e.currentDocument):Se.none(),r=e.updateTransforms?e.updateTransforms.map((s=>(function(o,c){let u=null;if("setToServerValue"in c)O(c.setToServerValue==="REQUEST_TIME",16630,{proto:c}),u=new zr;else if("appendMissingElements"in c){const f=c.appendMissingElements.values||[];u=new Gr(f)}else if("removeAllFromArray"in c){const f=c.removeAllFromArray.values||[];u=new Kr(f)}else"increment"in c?u=new dr(o,c.increment):"minimum"in c?u=new ei(o,c.minimum):"maximum"in c?u=new ti(o,c.maximum):B(16584,{proto:c});const h=Te.fromServerFormat(c.fieldPath);return new wu(h,u)})(n,s))):[];if(e.update){e.update.name;const s=Zn(n,e.update.name),i=new xe({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=(function(u){const h=u.fieldPaths||[];return new Ke(h.map((f=>Te.fromServerFormat(f))))})(e.updateMask);return new Gt(s,i,o,t,r)}return new ns(s,i,t,r)}if(e.delete){const s=Zn(n,e.delete);return new Pi(s,t)}if(e.verify){const s=Zn(n,e.verify);return new Qp(s,t)}return B(1463,{proto:e})}function iw(n,e){return n&&n.length>0?(O(e!==void 0,14353),n.map((t=>(function(s,i){let o=s.updateTime?je(s.updateTime):je(i);return o.isEqual(q.min())&&(o=je(i)),new RT(o,s.transformResults||[])})(t,e)))):[]}function gm(n,e){return{documents:[fm(n,e.path)]}}function _m(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=fm(n,s);const i=(function(h){if(h.length!==0)return Tm(oe.create(h,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(h){if(h.length!==0)return h.map((f=>(function(g){return{field:kr(g.field),direction:aw(g.dir)}})(f)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=Fc(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(h){return{before:h.inclusive,values:h.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(h){return{before:!h.inclusive,values:h.position}})(e.endAt)),{Se:t,parent:s}}function ym(n){let e=pm(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){O(r===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=(function(p){const g=Em(p);return g instanceof oe&&vu(g)?g.getFilters():[g]})(t.where));let o=[];t.orderBy&&(o=(function(p){return p.map((g=>(function(V){return new ni(Or(V.field),(function(k){switch(k){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(V.direction))})(g)))})(t.orderBy));let c=null;t.limit&&(c=(function(p){let g;return g=typeof p=="object"?p.value:p,fa(g)?null:g})(t.limit));let u=null;t.startAt&&(u=(function(p){const g=!!p.before,P=p.values||[];return new Hr(P,g)})(t.startAt));let h=null;return t.endAt&&(h=(function(p){const g=!p.before,P=p.values||[];return new Hr(P,g)})(t.endAt)),MT(e,s,o,i,c,"F",u,h)}function ow(n,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return B(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Im(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(n)))}}}}function Em(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Or(t.unaryFilter.field);return ne.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Or(t.unaryFilter.field);return ne.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Or(t.unaryFilter.field);return ne.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Or(t.unaryFilter.field);return ne.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return B(61313);default:return B(60726)}})(n):n.fieldFilter!==void 0?(function(t){return ne.create(Or(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return B(58110);default:return B(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return oe.create(t.compositeFilter.filters.map((r=>Em(r))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return B(1026)}})(t.compositeFilter.op))})(n):B(30097,{filter:n})}function aw(n){return ZT[n]}function cw(n){return ew[n]}function uw(n){return tw[n]}function kr(n){return{fieldPath:n.canonicalString()}}function Or(n){return Te.fromServerFormat(n.fieldPath)}function Tm(n){return n instanceof ne?(function(t){if(t.op==="=="){if(Ye(t.value))return{unaryFilter:{field:kr(t.field),op:"IS_NAN"}};if(et(t.value))return{unaryFilter:{field:kr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Ye(t.value))return{unaryFilter:{field:kr(t.field),op:"IS_NOT_NAN"}};if(et(t.value))return{unaryFilter:{field:kr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:kr(t.field),op:cw(t.op),value:t.value}}})(n):n instanceof oe?(function(t){const r=t.getFilters().map((s=>Tm(s)));return r.length===1?r[0]:{compositeFilter:{op:uw(t.op),filters:r}}})(n):B(54877,{filter:n})}function lw(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function wm(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function vm(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function oi(n,e){const t={fields:{}};return e.forEach(((r,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=r._toProto(n)})),{mapValue:t}}function Am(n){return{stringValue:n}}/**
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
 */function Ia(n){return new nw(n,!0)}/**
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
 */class st{constructor(e){this._byteString=e}static fromBase64String(e){try{return new st(he.fromBase64String(e))}catch(t){throw new N(C.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new st(he.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:st._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Ai(e,st._jsonSchema))return st.fromBase64String(e.bytes)}}st._jsonSchemaVersion="firestore/bytes/1.0",st._jsonSchema={type:_e("string",st._jsonSchemaVersion),bytes:_e("string")};/**
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
 */class Ea{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new N(C.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Te(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function hw(){return new Ea(_t)}/**
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
 */class Ci{constructor(e){this._methodName=e}}/**
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
 */class Rt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new N(C.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new N(C.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return H(this._lat,e._lat)||H(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Rt._jsonSchemaVersion}}static fromJSON(e){if(Ai(e,Rt._jsonSchema))return new Rt(e.latitude,e.longitude)}}Rt._jsonSchemaVersion="firestore/geoPoint/1.0",Rt._jsonSchema={type:_e("string",Rt._jsonSchemaVersion),latitude:_e("number"),longitude:_e("number")};/**
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
 */class Ce{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ce.UNAUTHENTICATED=new Ce(null),Ce.GOOGLE_CREDENTIALS=new Ce("google-credentials-uid"),Ce.FIRST_PARTY=new Ce("first-party-uid"),Ce.MOCK_USER=new Ce("mock-user");/**
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
 */class Pt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class Rm{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class dw{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Ce.UNAUTHENTICATED)))}shutdown(){}}class fw{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class pw{constructor(e){this.De=e,this.currentUser=Ce.UNAUTHENTICATED,this.xe=0,this.forceRefresh=!1,this.auth=null}start(e,t){O(this.Ce===void 0,42304);let r=this.xe;const s=u=>this.xe!==r?(r=this.xe,t(u)):Promise.resolve();let i=new Pt;this.Ce=()=>{this.xe++,this.currentUser=this.Fe(),i.resolve(),i=new Pt,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const u=i;e.enqueueRetryable((async()=>{await u.promise,await s(this.currentUser)}))},c=u=>{D("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.Ce&&(this.auth.addAuthTokenListener(this.Ce),o())};this.De.onInit((u=>c(u))),setTimeout((()=>{if(!this.auth){const u=this.De.getImmediate({optional:!0});u?c(u):(D("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Pt)}}),0),o()}getToken(){const e=this.xe,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.xe!==e?(D("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(O(typeof r.accessToken=="string",31837,{Oe:r}),new Rm(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.Ce&&this.auth.removeAuthTokenListener(this.Ce),this.Ce=void 0}Fe(){const e=this.auth&&this.auth.getUid();return O(e===null||typeof e=="string",2055,{Me:e}),new Ce(e)}}class mw{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r,this.type="FirstParty",this.user=Ce.FIRST_PARTY,this.Ue=new Map}ke(){return this.Be?this.Be():null}get headers(){this.Ue.set("X-Goog-AuthUser",this.Ne);const e=this.ke();return e&&this.Ue.set("Authorization",e),this.Le&&this.Ue.set("X-Goog-Iam-Authorization-Token",this.Le),this.Ue}}class gw{constructor(e,t,r){this.Ne=e,this.Le=t,this.Be=r}getToken(){return Promise.resolve(new mw(this.Ne,this.Le,this.Be))}start(e,t){e.enqueueRetryable((()=>t(Ce.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Pd{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class _w{constructor(e,t){this.qe=t,this.forceRefresh=!1,this.appCheck=null,this.$e=null,this.Ke=null,Ge(e)&&e.settings.appCheckToken&&(this.Ke=e.settings.appCheckToken)}start(e,t){O(this.Ce===void 0,3512);const r=i=>{i.error!=null&&D("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.$e;return this.$e=i.token,D("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.Ce=i=>{e.enqueueRetryable((()=>r(i)))};const s=i=>{D("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.Ce&&this.appCheck.addTokenListener(this.Ce)};this.qe.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.qe.getImmediate({optional:!0});i?s(i):D("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.Ke)return Promise.resolve(new Pd(this.Ke));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(O(typeof t.token=="string",44558,{tokenResult:t}),this.$e=t.token,new Pd(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.Ce&&this.appCheck.removeTokenListener(this.Ce),this.Ce=void 0}}function Pm(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */class yw{Qe(e){}shutdown(){}}/**
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
 */const bd="ConnectivityMonitor";class Sd{constructor(){this.We=()=>this.Ge(),this.ze=()=>this.je(),this.He=[],this.Je()}Qe(e){this.He.push(e)}shutdown(){window.removeEventListener("online",this.We),window.removeEventListener("offline",this.ze)}Je(){window.addEventListener("online",this.We),window.addEventListener("offline",this.ze)}Ge(){D(bd,"Network connectivity changed: AVAILABLE");for(const e of this.He)e(0)}je(){D(bd,"Network connectivity changed: UNAVAILABLE");for(const e of this.He)e(1)}static Ye(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let oo=null;function jc(){return oo===null?oo=(function(){return 268435456+Math.round(2147483648*Math.random())})():oo++,"0x"+oo.toString(16)}/**
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
 */const mc="RestConnection",Iw={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Ew{get Ze(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Xe=t+"://"+e.host,this.et=`projects/${r}/databases/${s}`,this.tt=this.databaseId.database===Fo?`project_id=${r}`:`project_id=${r}&database_id=${s}`}nt(e,t,r,s,i){const o=jc(),c=this.rt(e,t.toUriEncodedString());D(mc,`Sending RPC '${e}' ${o}:`,c,r);const u={"google-cloud-resource-prefix":this.et,"x-goog-request-params":this.tt};this.it(u,s,i);const{host:h}=new URL(c),f=yi(h);return this.st(e,c,u,r,f).then((p=>(D(mc,`Received RPC '${e}' ${o}: `,p),p)),(p=>{throw ct(mc,`RPC '${e}' ${o} failed with error: `,p,"url: ",c,"request:",r),p}))}_t(e,t,r,s,i,o){return this.nt(e,t,r,s,i)}it(e,t,r){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+ts})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),r&&r.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}rt(e,t){const r=Iw[e];let s=`${this.Xe}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
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
 */class Tw{constructor(e){this.ot=e.ot,this.ut=e.ut}ct(e){this.lt=e}Et(e){this.ht=e}Tt(e){this.Pt=e}onMessage(e){this.It=e}close(){this.ut()}send(e){this.ot(e)}Rt(){this.lt()}At(){this.ht()}Vt(e){this.Pt(e)}dt(e){this.It(e)}}/**
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
 */const ke="WebChannelConnection",As=(n,e,t)=>{n.listen(e,(r=>{try{t(r)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Fr extends Ew{constructor(e){super(e),this.ft=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static gt(){if(!Fr.yt){const e=Sp();As(e,bp.STAT_EVENT,(t=>{t.stat===Cc.PROXY?D(ke,"STAT_EVENT: detected buffering proxy"):t.stat===Cc.NOPROXY&&D(ke,"STAT_EVENT: detected no buffering proxy")})),Fr.yt=!0}}st(e,t,r,s,i){const o=jc();return new Promise(((c,u)=>{const h=new Rp;h.setWithCredentials(!0),h.listenOnce(Pp.COMPLETE,(()=>{try{switch(h.getLastErrorCode()){case Io.NO_ERROR:const p=h.getResponseJson();D(ke,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),c(p);break;case Io.TIMEOUT:D(ke,`RPC '${e}' ${o} timed out`),u(new N(C.DEADLINE_EXCEEDED,"Request time out"));break;case Io.HTTP_ERROR:const g=h.getStatus();if(D(ke,`RPC '${e}' ${o} failed with status:`,g,"response text:",h.getResponseText()),g>0){let P=h.getResponseJson();Array.isArray(P)&&(P=P[0]);const V=P==null?void 0:P.error;if(V&&V.status&&V.message){const L=(function($){const K=$.toLowerCase().replace(/_/g,"-");return Object.values(C).indexOf(K)>=0?K:C.UNKNOWN})(V.status);u(new N(L,V.message))}else u(new N(C.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new N(C.UNAVAILABLE,"Connection failed."));break;default:B(9055,{wt:e,streamId:o,bt:h.getLastErrorCode(),St:h.getLastError()})}}finally{D(ke,`RPC '${e}' ${o} completed.`)}}));const f=JSON.stringify(s);D(ke,`RPC '${e}' ${o} sending request:`,s),h.send(t,"POST",f,r,15)}))}vt(e,t,r){const s=jc(),i=[this.Xe,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.it(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const h=i.join("");D(ke,`Creating RPC '${e}' stream ${s}: ${h}`,c);const f=o.createWebChannel(h,c);this.Dt(f);let p=!1,g=!1;const P=new Tw({ot:V=>{g?D(ke,`Not sending because RPC '${e}' stream ${s} is closed:`,V):(p||(D(ke,`Opening RPC '${e}' stream ${s} transport.`),f.open(),p=!0),D(ke,`RPC '${e}' stream ${s} sending:`,V),f.send(V))},ut:()=>f.close()});return As(f,xs.EventType.OPEN,(()=>{g||(D(ke,`RPC '${e}' stream ${s} transport opened.`),P.Rt())})),As(f,xs.EventType.CLOSE,(()=>{g||(g=!0,D(ke,`RPC '${e}' stream ${s} transport closed`),P.Vt(),this.xt(f))})),As(f,xs.EventType.ERROR,(V=>{g||(g=!0,ct(ke,`RPC '${e}' stream ${s} transport errored. Name:`,V.name,"Message:",V.message),P.Vt(new N(C.UNAVAILABLE,"The operation could not be completed")))})),As(f,xs.EventType.MESSAGE,(V=>{var L;if(!g){const k=V.data[0];O(!!k,16349);const $=k,K=($==null?void 0:$.error)||((L=$[0])==null?void 0:L.error);if(K){D(ke,`RPC '${e}' stream ${s} received error:`,K);const j=K.status;let X=(function(E){const _=me[E];if(_!==void 0)return im(_)})(j),J=K.message;j==="NOT_FOUND"&&J.includes("database")&&J.includes("does not exist")&&J.includes(this.databaseId.database)&&ct(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),X===void 0&&(X=C.INTERNAL,J="Unknown error status: "+j+" with message "+K.message),g=!0,P.Vt(new N(X,J)),f.close()}else D(ke,`RPC '${e}' stream ${s} received:`,k),P.dt(k)}})),Fr.gt(),setTimeout((()=>{P.At()}),0),P}terminate(){this.ft.forEach((e=>e.close())),this.ft=[]}Dt(e){this.ft.push(e)}xt(e){this.ft=this.ft.filter((t=>t===e))}it(e,t,r){super.it(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Vp()}}/**
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
 */function ww(n){return new Fr(n)}Fr.yt=!1;class bm{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Ct=e,this.timerId=t,this.Ft=r,this.Ot=s,this.Mt=i,this.Nt=0,this.Lt=null,this.Bt=Date.now(),this.reset()}reset(){this.Nt=0}Ut(){this.Nt=this.Mt}kt(e){this.cancel();const t=Math.floor(this.Nt+this.qt()),r=Math.max(0,Date.now()-this.Bt),s=Math.max(0,t-r);s>0&&D("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Nt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Lt=this.Ct.enqueueAfterDelay(this.timerId,s,(()=>(this.Bt=Date.now(),e()))),this.Nt*=this.Ot,this.Nt<this.Ft&&(this.Nt=this.Ft),this.Nt>this.Mt&&(this.Nt=this.Mt)}$t(){this.Lt!==null&&(this.Lt.skipDelay(),this.Lt=null)}cancel(){this.Lt!==null&&(this.Lt.cancel(),this.Lt=null)}qt(){return(Math.random()-.5)*this.Nt}}/**
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
 */const Vd="PersistentStream";class Sm{constructor(e,t,r,s,i,o,c,u){this.Ct=e,this.Kt=r,this.Qt=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Wt=0,this.Gt=null,this.zt=null,this.stream=null,this.jt=0,this.Ht=new bm(e,t)}Jt(){return this.state===1||this.state===5||this.Yt()}Yt(){return this.state===2||this.state===3}start(){this.jt=0,this.state!==4?this.auth():this.Zt()}async stop(){this.Jt()&&await this.close(0)}Xt(){this.state=0,this.Ht.reset()}en(){this.Yt()&&this.Gt===null&&(this.Gt=this.Ct.enqueueAfterDelay(this.Kt,6e4,(()=>this.tn())))}nn(e){this.rn(),this.stream.send(e)}async tn(){if(this.Yt())return this.close(0)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}sn(){this.zt&&(this.zt.cancel(),this.zt=null)}async close(e,t){this.rn(),this.sn(),this.Ht.cancel(),this.Wt++,e!==4?this.Ht.reset():t&&t.code===C.RESOURCE_EXHAUSTED?($e(t.toString()),$e("Using maximum backoff delay to prevent overloading the backend."),this.Ht.Ut()):t&&t.code===C.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this._n(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Tt(t)}_n(){}auth(){this.state=1;const e=this.an(this.Wt),t=this.Wt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([r,s])=>{this.Wt===t&&this.un(r,s)}),(r=>{e((()=>{const s=new N(C.UNKNOWN,"Fetching auth token failed: "+r.message);return this.cn(s)}))}))}un(e,t){const r=this.an(this.Wt);this.stream=this.En(e,t),this.stream.ct((()=>{r((()=>this.listener.ct()))})),this.stream.Et((()=>{r((()=>(this.state=2,this.zt=this.Ct.enqueueAfterDelay(this.Qt,1e4,(()=>(this.Yt()&&(this.state=3),Promise.resolve()))),this.listener.Et())))})),this.stream.Tt((s=>{r((()=>this.cn(s)))})),this.stream.onMessage((s=>{r((()=>++this.jt==1?this.hn(s):this.onNext(s)))}))}Zt(){this.state=5,this.Ht.kt((async()=>{this.state=0,this.start()}))}cn(e){return D(Vd,`close with error: ${e}`),this.stream=null,this.close(4,e)}an(e){return t=>{this.Ct.enqueueAndForget((()=>this.Wt===e?t():(D(Vd,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class vw extends Sm{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}En(e,t){return this.connection.vt("Listen",e,t)}hn(e){return this.onNext(e)}onNext(e){this.Ht.reset();const t=sw(this.serializer,e),r=(function(i){if(!("targetChange"in i))return q.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?q.min():o.readTime?je(o.readTime):q.min()})(e);return this.listener.Tn(t,r)}Pn(e){const t={};t.database=qc(this.serializer),t.addTarget=(function(i,o){let c;const u=o.target;if(c=hn(u)?{pipelineQuery:Im(i,u)}:Pu(u)?{documents:gm(i,u)}:{query:_m(i,u).Se},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=hm(i,o.resumeToken);const h=Fc(i,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(q.min())>0){c.readTime=Xn(i,o.snapshotVersion.toTimestamp());const h=Fc(i,o.expectedCount);h!==null&&(c.expectedCount=h)}return c})(this.serializer,e);const r=ow(this.serializer,e);r&&(t.labels=r),this.nn(t)}In(e){const t={};t.database=qc(this.serializer),t.removeTarget=e,this.nn(t)}}class Aw extends Sm{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get Rn(){return this.jt>0}start(){this.lastStreamToken=void 0,super.start()}_n(){this.Rn&&this.An([])}En(e,t){return this.connection.vt("Write",e,t)}hn(e){return O(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,O(!e.writeResults||e.writeResults.length===0,55816),this.listener.Vn()}onNext(e){O(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.Ht.reset();const t=iw(e.writeResults,e.commitTime),r=je(e.commitTime);return this.listener.dn(r,t)}fn(){const e={};e.database=qc(this.serializer),this.nn(e)}An(e){const t={streamToken:this.lastStreamToken,writes:e.map((r=>Go(this.serializer,r)))};this.nn(t)}}/**
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
 */class Rw{}class Pw extends Rw{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.mn=!1}pn(){if(this.mn)throw new N(C.FAILED_PRECONDITION,"The client has already been terminated.")}nt(e,t,r,s){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.nt(e,Bc(t,r),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new N(C.UNKNOWN,i.toString())}))}_t(e,t,r,s,i){return this.pn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,c])=>this.connection._t(e,Bc(t,r),s,o,c,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===C.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new N(C.UNKNOWN,o.toString())}))}terminate(){this.mn=!0,this.connection.terminate()}}function bw(n,e,t,r){return new Pw(n,e,t,r)}/**
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
 */const Sw="ComponentProvider",Cd=new Map;function Vw(n,e,t,r,s){return new gT(n,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,Pm(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,r,s._customHeaders,s.grpcFlowControlWindow)}/**
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
 */const xd={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Vm=41943040;class Oe{static withCacheSize(e){return new Oe(e,Oe.DEFAULT_COLLECTION_PERCENTILE,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}Oe.DEFAULT_COLLECTION_PERCENTILE=10,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Oe.DEFAULT=new Oe(Vm,Oe.DEFAULT_COLLECTION_PERCENTILE,Oe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Oe.DISABLED=new Oe(-1,0,0);/**
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
 */class it{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.gn(r),this.yn=r=>t.writeSequenceNumber(r))}gn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.yn&&this.yn(e),e}}it.wn=-1;/**
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
 */const Cm="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class xm{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function gr(n){if(n.code!==C.FAILED_PRECONDITION||n.message!==Cm)throw n;D("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class A{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&B(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new A(((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof A?t:A.resolve(t)}catch(t){return A.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):A.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):A.reject(t)}static resolve(e){return new A(((t,r)=>{t(e)}))}static reject(e){return new A(((t,r)=>{r(e)}))}static waitFor(e){return new A(((t,r)=>{let s=0,i=0,o=!1;e.forEach((c=>{++s,c.next((()=>{++i,o&&i===s&&t()}),(u=>r(u)))})),o=!0,i===s&&t()}))}static or(e){let t=A.resolve(!1);for(const r of e)t=t.next((s=>s?A.resolve(s):r()));return t}static forEach(e,t){const r=[];return e.forEach(((s,i)=>{r.push(t.call(this,s,i))})),this.waitFor(r)}static mapArray(e,t){return new A(((r,s)=>{const i=e.length,o=new Array(i);let c=0;for(let u=0;u<i;u++){const h=u;t(e[h]).next((f=>{o[h]=f,++c,c===i&&r(o)}),(f=>s(f)))}}))}static doWhile(e,t){return new A(((r,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):r()};i()}))}}/**
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
 */const Ze="SimpleDb";class Ta{static open(e,t,r,s){try{return new Ta(t,e.transaction(s,r))}catch(i){throw new $s(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.bn=new Pt,this.transaction.oncomplete=()=>{this.bn.resolve()},this.transaction.onabort=()=>{t.error?this.bn.reject(new $s(e,t.error)):this.bn.resolve()},this.transaction.onerror=r=>{const s=xu(r.target.error);this.bn.reject(new $s(e,s))}}get Sn(){return this.bn.promise}abort(e){e&&this.bn.reject(e),this.aborted||(D(Ze,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}vn(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new xw(t)}}class mn{static delete(e){return D(Ze,"Removing database:",e),$n(xf().indexedDB.deleteDatabase(e)).toPromise()}static Ye(){if(!Ff())return!1;if(mn.Dn())return!0;const e=we(),t=mn.xn(e),r=0<t&&t<10,s=Dm(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||i)}static Dn(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static Cn(e,t){return e.store(t)}static xn(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}constructor(e,t,r){this.name=e,this.version=t,this.Fn=r,this.On=null,mn.xn(we())===12.2&&$e("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async Mn(e){return this.db||(D(Ze,"Opening database:",this.name),this.db=await new Promise(((t,r)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{r(new $s(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?r(new N(C.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new N(C.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new $s(e,o))},s.onupgradeneeded=i=>{D(Ze,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.Fn.Nn(o,s.transaction,i.oldVersion,this.version).next((()=>{D(Ze,"Database upgrade to version "+this.version+" complete")}))}}))),this.Ln&&(this.db.onversionchange=t=>this.Ln(t)),this.db}Bn(e){this.Ln=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,r,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.Mn(e);const c=Ta.open(this.db,e,i?"readonly":"readwrite",r),u=s(c).next((h=>(c.vn(),h))).catch((h=>(c.abort(h),A.reject(h)))).toPromise();return u.catch((()=>{})),await c.Sn,u}catch(c){const u=c,h=u.name!=="FirebaseError"&&o<3;if(D(Ze,"Transaction failed with error:",u.message,"Retrying:",h),this.close(),!h)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Dm(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class Cw{constructor(e){this.Un=e,this.kn=!1,this.qn=null}get isDone(){return this.kn}get $n(){return this.qn}set cursor(e){this.Un=e}done(){this.kn=!0}Kn(e){this.qn=e}delete(){return $n(this.Un.delete())}}class $s extends N{constructor(e,t){super(C.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Dn(n){return n.name==="IndexedDbTransactionError"}class xw{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(D(Ze,"PUT",this.store.name,e,t),r=this.store.put(t,e)):(D(Ze,"PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),$n(r)}add(e){return D(Ze,"ADD",this.store.name,e,e),$n(this.store.add(e))}get(e){return $n(this.store.get(e)).next((t=>(t===void 0&&(t=null),D(Ze,"GET",this.store.name,e,t),t)))}delete(e){return D(Ze,"DELETE",this.store.name,e),$n(this.store.delete(e))}count(){return D(Ze,"COUNT",this.store.name),$n(this.store.count())}Qn(e,t){const r=this.options(e,t),s=r.index?this.store.index(r.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(r.range);return new A(((o,c)=>{i.onerror=u=>{c(u.target.error)},i.onsuccess=u=>{o(u.target.result)}}))}{const i=this.cursor(r),o=[];return this.Wn(i,((c,u)=>{o.push(u)})).next((()=>o))}}Gn(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new A(((s,i)=>{r.onerror=o=>{i(o.target.error)},r.onsuccess=o=>{s(o.target.result)}}))}zn(e,t){D(Ze,"DELETE ALL",this.store.name);const r=this.options(e,t);r.jn=!1;const s=this.cursor(r);return this.Wn(s,((i,o,c)=>c.delete()))}Hn(e,t){let r;t?r=e:(r={},t=e);const s=this.cursor(r);return this.Wn(s,t)}Jn(e){const t=this.cursor({});return new A(((r,s)=>{t.onerror=i=>{const o=xu(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next((c=>{c?o.continue():r()})):r()}}))}Wn(e,t){const r=[];return new A(((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const c=o.target.result;if(!c)return void s();const u=new Cw(c),h=t(c.primaryKey,c.value,u);if(h instanceof A){const f=h.catch((p=>(u.done(),A.reject(p))));r.push(f)}u.isDone?s():u.$n===null?c.continue():c.continue(u.$n)}})).next((()=>A.waitFor(r)))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.jn?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function $n(n){return new A(((e,t)=>{n.onsuccess=r=>{const s=r.target.result;e(s)},n.onerror=r=>{const s=xu(r.target.error);t(s)}}))}let Dd=!1;function xu(n){const e=mn.xn(we());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new N("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Dd||(Dd=!0,setTimeout((()=>{throw r}),0)),r}}return n}/**
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
 */const Nd="LruGarbageCollector",Dw=1048576;function kd([n,e],[t,r]){const s=H(n,t);return s===0?H(e,r):s}class Nw{constructor(e){this.Yn=e,this.buffer=new ie(kd),this.Zn=0}Xn(){return++this.Zn}er(e){const t=[e,this.Xn()];if(this.buffer.size<this.Yn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();kd(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class Nm{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.tr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.nr(6e4)}stop(){this.tr&&(this.tr.cancel(),this.tr=null)}get started(){return this.tr!==null}nr(e){D(Nd,`Garbage collection scheduled in ${e}ms`),this.tr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.tr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Dn(t)?D(Nd,"Ignoring IndexedDB error during garbage collection: ",t):await gr(t)}await this.nr(3e5)}))}}class kw{constructor(e,t){this.rr=e,this.params=t}calculateTargetCount(e,t){return this.rr.ir(e).next((r=>Math.floor(t/100*r)))}nthSequenceNumber(e,t){if(t===0)return A.resolve(it.wn);const r=new Nw(t);return this.rr.forEachTarget(e,(s=>r.er(s.sequenceNumber))).next((()=>this.rr.sr(e,(s=>r.er(s))))).next((()=>r.maxValue))}removeTargets(e,t,r){return this.rr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.rr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(D("LruGarbageCollector","Garbage collection skipped; disabled"),A.resolve(xd)):this.getCacheSize(e).next((r=>r<this.params.cacheSizeCollectionThreshold?(D("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),xd):this._r(e,t)))}getCacheSize(e){return this.rr.getCacheSize(e)}_r(e,t){let r,s,i,o,c,u,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((p=>(p>this.params.maximumSequenceNumbersToCollect?(D("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),s=this.params.maximumSequenceNumbersToCollect):s=p,o=Date.now(),this.nthSequenceNumber(e,s)))).next((p=>(r=p,c=Date.now(),this.removeTargets(e,r,t)))).next((p=>(i=p,u=Date.now(),this.removeOrphanedDocuments(e,r)))).next((p=>(h=Date.now(),xr()<=te.DEBUG&&D("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(c-o)+`ms
	Removed ${i} targets in `+(u-c)+`ms
	Removed ${p} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),A.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:p}))))}}function km(n,e){return new kw(n,e)}/**
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
 */const Om="firestore.googleapis.com",Od=!0;class Ld{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new N(C.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Om,this.ssl=Od}else this.host=e.host,this.ssl=e.ssl??Od;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=Vm;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Dw)throw new N(C.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(pT("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Pm(e.experimentalLongPollingOptions??{}),(function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new N(C.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new N(C.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(r,s){if(r===s)return!0;if(!r||!s)return!1;const i=Object.keys(r),o=Object.keys(s);if(i.length!==o.length)return!1;for(const c of i)if(r[c]!==s[c])return!1;return!0})(this._customHeaders,e._customHeaders)}}let wa=class{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ld({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new N(C.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new N(C.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ld(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new dw;switch(r.type){case"firstParty":return new gw(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new N(C.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=Cd.get(t);r&&(D(Sw,"Removing Datastore"),Cd.delete(t),r.terminate())})(this),Promise.resolve()}};function Ow(n,e,t,r={}){var h;n=He(n,wa);const s=yi(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;s&&Bf(`https://${c}`),i.host!==Om&&i.host!==c&&ct("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...i,host:c,ssl:s,emulatorOptions:r};if(!sr(u,o)&&(n._setSettings(u),r.mockUserToken)){let f,p;if(typeof r.mockUserToken=="string")f=r.mockUserToken,p=Ce.MOCK_USER;else{f=q_(r.mockUserToken,(h=n._app)==null?void 0:h.options.projectId);const g=r.mockUserToken.sub||r.mockUserToken.user_id;if(!g)throw new N(C.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Ce(g)}n._authCredentials=new fw(new Rm(f,p))}}/**
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
 */class Ht{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Ht(this.firestore,e,this._query)}}class pe{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new gn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new pe(this.firestore,e,this._key)}toJSON(){return{type:pe._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(Ai(t,pe._jsonSchema))return new pe(e,r||null,new F(Z.fromString(t.referencePath)))}}pe._jsonSchemaVersion="firestore/documentReference/1.0",pe._jsonSchema={type:_e("string",pe._jsonSchemaVersion),referencePath:_e("string")};class gn extends Ht{constructor(e,t,r){super(e,t,bi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new pe(this.firestore,null,new F(e))}withConverter(e){return new gn(this.firestore,e,this._path)}}function ib(n,e,...t){if(n=ve(n),Np("collection","path",e),n instanceof wa){const r=Z.fromString(e,...t);return id(r),new gn(n,null,r)}{if(!(n instanceof pe||n instanceof gn))throw new N(C.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Z.fromString(e,...t));return id(r),new gn(n.firestore,null,r)}}function Lw(n,e,...t){if(n=ve(n),arguments.length===1&&(e=_u.newId()),Np("doc","path",e),n instanceof wa){const r=Z.fromString(e,...t);return sd(r),new pe(n,null,new F(r))}{if(!(n instanceof pe||n instanceof gn))throw new N(C.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Z.fromString(e,...t));return sd(r),new pe(n.firestore,n instanceof gn?n.converter:null,new F(r))}}/**
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
 */class We{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:We._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Ai(e,We._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new We(e.vectorValues);throw new N(C.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}We._jsonSchemaVersion="firestore/vectorValue/1.0",We._jsonSchema={type:_e("string",We._jsonSchemaVersion),vectorValues:_e("object")};/**
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
 */const Mw=/^__.*__$/;class Uw{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Gt(e,this.data,this.fieldMask,t,this.fieldTransforms):new ns(e,this.data,t,this.fieldTransforms)}}class Lm{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Gt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Mm(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw B(40011,{dataSource:n})}}class Du{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Du({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Ko(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(Mm(this.dataSource)&&Mw.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class Fw{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Ia(e)}createContext(e,t,r,s=!1){return new Du({dataSource:e,methodName:t,targetDoc:r,path:Te.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function va(n){const e=n._freezeSettings(),t=Ia(n._databaseId);return new Fw(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Nu(n,e,t,r,s,i={}){const o=n.createContext(i.merge||i.mergeFields?2:0,e,t,s);Lu("Data must be an object, but it was:",o,r);const c=Um(r,o);let u,h;if(i.merge)u=new Ke(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const p of i.mergeFields){const g=$t(e,p,t);if(!o.contains(g))throw new N(C.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);$m(f,g)||f.push(g)}u=new Ke(f),h=o.fieldTransforms.filter((p=>u.covers(p.field)))}else u=null,h=o.fieldTransforms;return new Uw(new xe(c),u,h)}class Aa extends Ci{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Aa}}class ku extends Ci{_toFieldTransform(e){return new wu(e.path,new zr)}isEqual(e){return e instanceof ku}}class Ou extends Ci{constructor(e,t){super(e),this.ur=t}_toFieldTransform(e){const t=new dr(e.serializer,ma(e.serializer,this.ur));return new wu(e.path,t)}isEqual(e){return e instanceof Ou&&(this.ur===e.ur||Number.isNaN(this.ur)&&Number.isNaN(e.ur))}}function Bw(n,e,t,r){const s=n.createContext(1,e,t);Lu("Data must be an object, but it was:",s,r);const i=[],o=xe.empty();xn(r,((u,h)=>{const f=qm(e,u,t);h=ve(h);const p=s.childContextForFieldPath(f);if(h instanceof Aa)i.push(f);else{const g=wn(h,p);g!=null&&(i.push(f),o.set(f,g))}}));const c=new Ke(i);return new Lm(o,c,s.fieldTransforms)}function qw(n,e,t,r,s,i){const o=n.createContext(1,e,t),c=[$t(e,r,t)],u=[s];if(i.length%2!=0)throw new N(C.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)c.push($t(e,i[g])),u.push(i[g+1]);const h=[],f=xe.empty();for(let g=c.length-1;g>=0;--g)if(!$m(h,c[g])){const P=c[g];let V=u[g];V=ve(V);const L=o.childContextForFieldPath(P);if(V instanceof Aa)h.push(P);else{const k=wn(V,L);k!=null&&(h.push(P),f.set(P,k))}}const p=new Ke(h);return new Lm(f,p,o.fieldTransforms)}function $w(n,e,t,r=!1){return wn(t,n.createContext(r?4:3,e))}function wn(n,e,t){if(Bm(n=ve(n)))return Lu("Unsupported field value:",e,n),Um(n,e);if(n instanceof Ci)return(function(s,i){if(!Mm(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let c=0;for(const u of s){let h=wn(u,i.childContextForArray(c));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),c++}return{arrayValue:{values:o}}})(n,e)}return(function(s,i,o){if((s=ve(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return ma(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const c=se.fromDate(s);return{timestampValue:Xn(i.serializer,c)}}if(s instanceof se){const c=new se(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Xn(i.serializer,c)}}if(Fm(s)){const c=se.fromInstant(s),u=new se(c.seconds,1e3*Math.floor(c.nanoseconds/1e3));return{timestampValue:Xn(i.serializer,u)}}if(s instanceof Rt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof st)return{bytesValue:hm(i.serializer,s._byteString)};if(s instanceof pe){const c=i.databaseId,u=s.firestore._databaseId;if(!u.isEqual(c))throw i.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${c.projectId}/${c.database}`);return{referenceValue:Cu(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof We)return(function(u,h){const f=u instanceof We?u.toArray():u;return{mapValue:{fields:{[yu]:{stringValue:Iu},[lr]:{arrayValue:{values:f.map((g=>{if(typeof g!="number")throw h.createError("VectorValues must only contain numeric values.");return pa(h.serializer,g)}))}}}}}})(s,i);if(vm(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${ha(s)}`)})(n,e)}function Um(n,e){const t={};return Dp(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):xn(n,((r,s)=>{const i=wn(s,e.childContextForField(r));i!=null&&(t[r]=i)})),{mapValue:{fields:t}}}function Fm(n){if(typeof n!="object"||n===null)return!1;if(typeof Temporal<"u"&&typeof Temporal.Instant=="function"&&n instanceof Temporal.Instant)return!0;const e=n;return e[Symbol.toStringTag]==="Temporal.Instant"&&typeof e.t=="bigint"}function Bm(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof se||n instanceof Rt||n instanceof st||n instanceof pe||n instanceof Ci||n instanceof We||Fm(n)||vm(n))}function Lu(n,e,t){if(!Bm(t)||!vi(t)){const r=ha(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function $t(n,e,t){if((e=ve(e))instanceof Ea)return e._internalPath;if(typeof e=="string")return qm(n,e);throw Ko("Field path arguments must be of type string or ",n,!1,void 0,t)}const jw=new RegExp("[~\\*/\\[\\]]");function qm(n,e,t){if(e.search(jw)>=0)throw Ko(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Ea(...e.split("."))._internalPath}catch{throw Ko(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Ko(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${r}`),o&&(u+=` in document ${s}`),u+=")"),new N(C.INVALID_ARGUMENT,c+n+u)}function $m(n,e){return n.some((t=>t.isEqual(e)))}function jm(n){return typeof n._readUserData=="function"}/**
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
 */class Fe{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const r=xe.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let c;i.nestedOptions&&vi(o)?c={mapValue:{fields:new Fe(i.nestedOptions).getOptionsProto(t,o)}}:o&&(c=wn(o,t)??void 0),c&&r.set(Te.fromServerFormat(i.serverName),c)}}return r}getOptionsProto(e,t,r){const s=this._getKnownOptions(t,e);if(r){const i=new Map(fT(r,((o,c)=>[Te.fromServerFormat(c),o!==void 0?wn(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
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
 */function zw(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!vi(t.fields))})(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(n.pipelineValue)))}function ob(){return new ku("serverTimestamp")}function ab(n){return new Ou("increment",n)}function Gw(n){return new We(n)}/**
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
 */function M(n){let e;return n instanceof _r?n:(e=vi(n)?Yw(n):n instanceof Array?Jw(n):zm(n,void 0),e)}function gc(n){if(n instanceof _r)return n;if(n instanceof We)return ai(n);if(Array.isArray(n))return ai(Gw(n));throw new Error("Unsupported value: "+typeof n)}function Mu(n){return IT(n)?Ro(n):M(n)}class _r{constructor(){this._protoValueType="ProtoValue"}add(e){return new x("add",[this,M(e)],"add")}asBoolean(){if(this instanceof vn)return this;if(this instanceof Ir)return new Km(this);if(this instanceof yr)return new Qw(this);if(this instanceof x)return new Gm(this);throw new N("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new x("subtract",[this,M(e)],"subtract")}multiply(e){return new x("multiply",[this,M(e)],"multiply")}divide(e){return new x("divide",[this,M(e)],"divide")}mod(e){return new x("mod",[this,M(e)],"mod")}equal(e){return new x("equal",[this,M(e)],"equal").asBoolean()}notEqual(e){return new x("not_equal",[this,M(e)],"notEqual").asBoolean()}lessThan(e){return new x("less_than",[this,M(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new x("less_than_or_equal",[this,M(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new x("greater_than",[this,M(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new x("greater_than_or_equal",[this,M(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map((s=>M(s)));return new x("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new x("array_contains",[this,M(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Ns(e.map(M),"arrayContainsAll"):e;return new x("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Ns(e.map(M),"arrayContainsAny"):e;return new x("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new x("array_reverse",[this])}arrayLength(){return new x("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Ns(e.map(M),"equalAny"):e;return new x("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Ns(e.map(M),"notEqualAny"):e;return new x("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new x("exists",[this],"exists").asBoolean()}charLength(){return new x("char_length",[this],"charLength")}like(e){return new x("like",[this,M(e)],"like").asBoolean()}regexContains(e){return new x("regex_contains",[this,M(e)],"regexContains").asBoolean()}regexFind(e){return new x("regex_find",[this,M(e)],"regexFind")}regexFindAll(e){return new x("regex_find_all",[this,M(e)],"regexFindAll")}regexMatch(e){return new x("regex_match",[this,M(e)],"regexMatch").asBoolean()}stringContains(e){return new x("string_contains",[this,M(e)],"stringContains").asBoolean()}startsWith(e){return new x("starts_with",[this,M(e)],"startsWith").asBoolean()}endsWith(e){return new x("ends_with",[this,M(e)],"endsWith").asBoolean()}toLower(){return new x("to_lower",[this],"toLower")}toUpper(){return new x("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(M(e)),new x("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(M(e)),new x("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(M(e)),new x("rtrim",t,"rtrim")}type(){return new x("type",[this])}isType(e){return new x("is_type",[this,ai(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(M);return new x("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new x("string_index_of",[this,M(e)],"stringIndexOf")}stringRepeat(e){return new x("string_repeat",[this,M(e)],"stringRepeat")}stringReplaceAll(e,t){return new x("string_replace_all",[this,M(e),M(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new x("string_replace_one",[this,M(e),M(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(M);return new x("concat",[this,...r],"concat")}reverse(){return new x("reverse",[this],"reverse")}arrayFilter(e,t){return new x("array_filter",[this,M(e),t],"arrayFilter")}arrayTransform(e,t){return new x("array_transform",[this,M(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new x("array_transform",[this,M(e),M(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,M(e)];return t!==void 0&&r.push(M(t)),new x("array_slice",r,"arraySlice")}arrayFirst(){return new x("array_first",[this],"arrayFirst")}arrayFirstN(e){return new x("array_first_n",[this,M(e)],"arrayFirstN")}arrayLast(){return new x("array_last",[this],"arrayLast")}arrayLastN(e){return new x("array_last_n",[this,M(e)],"arrayLastN")}arrayMaximum(){return new x("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new x("maximum_n",[this,M(e)],"arrayMaximumN")}arrayMinimum(){return new x("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new x("minimum_n",[this,M(e)],"arrayMinimumN")}arrayIndexOf(e){return new x("array_index_of",[this,M(e),M("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new x("array_index_of",[this,M(e),M("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new x("array_index_of_all",[this,M(e)],"arrayIndexOfAll")}byteLength(){return new x("byte_length",[this],"byteLength")}ceil(){return new x("ceil",[this])}floor(){return new x("floor",[this])}abs(){return new x("abs",[this])}exp(){return new x("exp",[this])}mapGet(e){return new x("map_get",[this,ai(e)],"mapGet")}mapSet(e,t,...r){const s=[this,M(e),M(t),...r.map(M)];return new x("map_set",s,"mapSet")}mapKeys(){return new x("map_keys",[this],"mapKeys")}mapValues(){return new x("map_values",[this],"mapValues")}mapEntries(){return new x("map_entries",[this],"mapEntries")}getField(e){return new x("get_field",[this,M(e)],"get_field")}count(){return Xe._create("count",[this],"count")}sum(){return Xe._create("sum",[this],"sum")}average(){return Xe._create("average",[this],"average")}minimum(){return Xe._create("minimum",[this],"minimum")}maximum(){return Xe._create("maximum",[this],"maximum")}first(){return Xe._create("first",[this],"first")}last(){return Xe._create("last",[this],"last")}arrayAgg(){return Xe._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Xe._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Xe._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new x("maximum",[this,...r.map(M)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new x("minimum",[this,...r.map(M)],"minimum")}vectorLength(){return new x("vector_length",[this],"vectorLength")}cosineDistance(e){return new x("cosine_distance",[this,gc(e)],"cosineDistance")}dotProduct(e){return new x("dot_product",[this,gc(e)],"dotProduct")}euclideanDistance(e){return new x("euclidean_distance",[this,gc(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new x("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new x("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new x("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new x("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new x("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new x("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new x("timestamp_add",[this,M(e),M(t)],"timestampAdd")}timestampSubtract(e,t){return new x("timestamp_subtract",[this,M(e),M(t)],"timestampSubtract")}timestampDiff(e,t){return new x("timestamp_diff",[this,Mu(e),M(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,M(e)];return t&&r.push(M(t)),new x("timestamp_extract",r,"timestampExtract")}documentId(){return new x("document_id",[this],"documentId")}parent(){return new x("parent",[this],"parent")}substring(e,t){const r=M(e);return new x("substring",t===void 0?[this,r]:[this,r,M(t)],"substring")}arrayGet(e){return new x("array_get",[this,M(e)],"arrayGet")}isError(){return new x("is_error",[this],"isError").asBoolean()}ifError(e){const t=new x("if_error",[this,M(e)],"ifError");return e instanceof vn?t.asBoolean():t}isAbsent(){return new x("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new x("map_remove",[this,M(e)],"mapRemove")}mapMerge(e,...t){const r=M(e),s=t.map(M);return new x("map_merge",[this,r,...s],"mapMerge")}pow(e){return new x("pow",[this,M(e)])}trunc(e){return e===void 0?new x("trunc",[this]):new x("trunc",[this,M(e)],"trunc")}round(e){return e===void 0?new x("round",[this]):new x("round",[this,M(e)],"round")}collectionId(){return new x("collection_id",[this])}length(){return new x("length",[this])}ln(){return new x("ln",[this])}sqrt(){return new x("sqrt",[this])}stringReverse(){return new x("string_reverse",[this])}ifAbsent(e){return new x("if_absent",[this,M(e)],"ifAbsent")}ifNull(e){return new x("if_null",[this,M(e)],"ifNull")}coalesce(e,...t){return new x("coalesce",[this,M(e),...t.map(M)],"coalesce")}join(e){return new x("join",[this,M(e)],"join")}log10(){return new x("log10",[this])}arraySum(){return new x("sum",[this])}split(e){return new x("split",[this,M(e)])}timestampTruncate(e,t){const r=[this,M(e)];return t&&r.push(M(t)),new x("timestamp_trunc",r)}ascending(){return Xw(this)}descending(){return Zw(this)}as(e){return new Hw(this,e,"as")}}class Xe{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const s=new Xe(e,t);return s._methodName=r,s}as(e){return new Kw(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class Kw{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class Hw{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Ns extends _r{constructor(e,t){super(),this.cr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.cr.map((t=>t._toProto(e)))}}}_readUserData(e){this.cr.forEach((t=>t._readUserData(e)))}}class yr extends _r{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new x("geo_distance",[this,M(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Ro(n){return Ww(n,"field")}function Ww(n,e){return new yr(typeof n=="string"?_t===n?hw()._internalPath:$t("field",n):n._internalPath,e)}class Ir extends _r{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Ir(e,void 0);return t._protoValue=e,t}_toProto(e){return O(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,zw(this._protoValue)||(this._protoValue=wn(this.value,e))}}function ai(n,e){return zm(n,"constant")}function zm(n,e){const t=new Ir(n,e);return typeof n=="boolean"?new Km(t):t}class x extends _r{constructor(e,t,r,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Fe({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((r=>r._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class vn extends _r{get _methodName(){return this._expr._methodName}countIf(){return Xe._create("count_if",[this],"countIf")}not(){return new x("not",[this],"not").asBoolean()}conditional(e,t){return new x("conditional",[this,e,t],"conditional")}ifError(e){const t=M(e),r=new x("if_error",[this,t],"ifError");return t instanceof vn?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Gm extends vn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Km extends vn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Qw extends vn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function Yw(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const s=n[r];t.push(ai(r)),t.push(M(s))}return new x("map",t,"map")}function Jw(n){return(function(t,r){return new x("array",t.map((s=>M(s))),r)})(n,"array")}function Xw(n){return new Uu(Mu(n),"ascending","ascending")}function Zw(n){return new Uu(Mu(n),"descending","descending")}class Uu{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Am(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
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
 */class nt{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Hm extends nt{get _name(){return"add_fields"}get _optionsUtil(){return new Fe({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[oi(e,this.fields)]}}_readUserData(e){super._readUserData(e),Rn(this.fields,e)}}class Wm extends nt{get _name(){return"aggregate"}get _optionsUtil(){return new Fe({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[oi(e,this.accumulators),oi(e,this.groups)]}}_readUserData(e){super._readUserData(e),Rn(this.groups,e),Rn(this.accumulators,e)}}class Qm extends nt{get _name(){return"distinct"}get _optionsUtil(){return new Fe({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[oi(e,this.groups)]}}_readUserData(e){super._readUserData(e),Rn(this.groups,e)}}class xi extends nt{get _name(){return"collection"}get _optionsUtil(){return new Fe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.hr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.hr}]}}_readUserData(e){super._readUserData(e)}}class Di extends nt{get _name(){return"collection_group"}get _optionsUtil(){return new Fe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Ra extends nt{get _name(){return"database"}get _optionsUtil(){return new Fe({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Pa extends nt{get _name(){return"documents"}get _optionsUtil(){return new Fe({})}constructor(e,t){if(super(t),!e||e.length===0)throw new N(C.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(r);if(s.size!==r.length)throw new N(C.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.Tr=r,this.Pr=s}_toProto(e){return{...super._toProto(e),args:this.Tr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class Ni extends nt{get _name(){return"where"}get _optionsUtil(){return new Fe({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),Rn(this.condition,e)}}class An extends nt{get _name(){return"limit"}get _optionsUtil(){return new Fe({})}constructor(e,t){O(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[ma(e,this.limit)]}}}class Md extends nt{get _name(){return"offset"}get _optionsUtil(){return new Fe({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[ma(e,this.offset)]}}}class ev extends nt{get _name(){return"select"}get _optionsUtil(){return new Fe({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[oi(e,this.selections)]}}_readUserData(e){super._readUserData(e),Rn(this.selections,e)}}class It extends nt{get _name(){return"sort"}get _optionsUtil(){return new Fe({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),Rn(this.orderings,e)}}class Fu extends nt{get _name(){return"replace_with"}get _optionsUtil(){return new Fe({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Am(Fu.Ir)]}}_readUserData(e){super._readUserData(e),Rn(this.map,e)}}Fu.Ir="full_replace";function Rn(n,e){return jm(n)?n._readUserData(e):Array.isArray(n)?n.forEach((t=>t._readUserData(e))):n instanceof Map?n.forEach((t=>t._readUserData(e))):Object.values(n).forEach((t=>t._readUserData(e))),n}/**
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
 */class js{constructor(e,t,r,s){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=s}Vr(e,t){const r=this.userDataReader.createContext(3,e);return jm(t)?t._readUserData(r):Array.isArray(t)?t.forEach((s=>s._readUserData(r))):t.forEach((s=>s._readUserData(r))),t}where(e){const t=this.stages.map((r=>r));return this.Vr("where",e),t.push(new Ni(e,{})),new js(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((r=>r));return t.push(new An(e,{})),new js(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map((s=>s));return"orderings"in e?r.push(new It(this.Vr("sort",e.orderings),{})):r.push(new It(this.Vr("sort",[e,...t]),{})),new js(this._db,this.userDataReader,this._userDataWriter,r)}dr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class Le{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return ki(this)}getPipelineCollectionGroup(){return Bu(this)}getPipelineCollectionId(){return tv(this)}getPipelineDocuments(){return zc(this)}getPipelineFlavor(){return(function(t){let r="exact";return t.stages.forEach(((s,i)=>{s._name!==Qm.name&&s._name!==Wm.name||(r="keyless"),s._name===ev.name&&r==="exact"&&(r="augmented"),s._name===Hm.name&&i<t.stages.length-1&&r==="exact"&&(r="augmented")})),r})(this)}getPipelineSourceType(){return _n(this)}}function _n(n){const e=n.stages[0];return e instanceof xi||e instanceof Di||e instanceof Ra||e instanceof Pa?e._name:"unknown"}function ki(n){if(_n(n)==="collection")return n.stages[0].hr}function Bu(n){if(_n(n)==="collection_group")return n.stages[0].collectionId}function tv(n){switch(_n(n)){case"collection":return Z.fromString(ki(n)).lastSegment();case"collection_group":return Bu(n);default:return}}function zc(n){if(_n(n)==="documents")return n.stages[0].Tr}class T{constructor(e,t){this.type=e,this.value=t}static mr(){return new T("ERROR",void 0)}static pr(){return new T("UNSET",void 0)}static gr(){return new T("NULL",At)}static newValue(e){return et(e)?new T("NULL",At):(function(r){return!!r&&"booleanValue"in r})(e)?new T("BOOLEAN",e):yt(e)?new T("INT",e):Hn(e)?new T("DOUBLE",e):(function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue})(e)?new T("TIMESTAMP",e):(function(r){return!!r&&"stringValue"in r})(e)?new T("STRING",e):(function(r){return!!r&&"bytesValue"in r})(e)?new T("BYTES",e):e.referenceValue?new T("REFERENCE",e):e.geoPointValue?new T("GEO_POINT",e):Tn(e)?new T("ARRAY",e):hr(e)?new T("VECTOR",e):Jn(e)?new T("MAP",e):new T("ERROR",void 0)}yr(){return this.type==="ERROR"||this.type==="UNSET"}wr(){return this.type==="NULL"}}function zs(n){if(!n.yr())return n.value}function Ym(n){return n instanceof vn?n._expr:n}function z(n){if((n=Ym(n))instanceof yr)return new nv(n);if(n instanceof Ir)return new rv(n);if(n instanceof Ns)return new sv(n);if(n instanceof x){if(n.name==="add")return new av(n);if(n.name==="subtract")return new cv(n);if(n.name==="multiply")return new uv(n);if(n.name==="divide")return new lv(n);if(n.name==="mod")return new hv(n);if(n.name==="and")return new dv(n);if(n.name==="equal")return new Av(n);if(n.name==="not_equal")return new Rv(n);if(n.name==="less_than")return new Pv(n);if(n.name==="less_than_or_equal")return new bv(n);if(n.name==="greater_than")return new Sv(n);if(n.name==="greater_than_or_equal")return new Vv(n);if(n.name==="array_concat")return new Cv(n);if(n.name==="array_reverse")return new xv(n);if(n.name==="array_contains")return new Dv(n);if(n.name==="array_contains_all")return new Nv(n);if(n.name==="array_contains_any")return new kv(n);if(n.name==="array_length")return new Ov(n);if(n.name==="array_element")return new Lv(n);if(n.name==="equal_any")return new Jm(n);if(n.name==="not_equal_any")return new pv(n);if(n.name==="is_nan")return new mv(n);if(n.name==="is_not_nan")return new gv(n);if(n.name==="is_null")return new _v(n);if(n.name==="is_not_null")return new yv(n);if(n.name==="is_error")return new Iv(n);if(n.name==="exists")return new Ev(n);if(n.name==="not")return new ba(n);if(n.name==="or")return new fv(n);if(n.name==="xor")return new qu(n);if(n.name==="conditional")return new Tv(n);if(n.name==="maximum")return new wv(n);if(n.name==="minimum")return new vv(n);if(n.name==="reverse")return new Mv(n);if(n.name==="replace_first")return new Uv(n);if(n.name==="replace_all")return new Fv(n);if(n.name==="char_length")return new Bv(n);if(n.name==="byte_length")return new qv(n);if(n.name==="like")return new $v(n);if(n.name==="regex_contains")return new jv(n);if(n.name==="regex_match")return new zv(n);if(n.name==="string_contains")return new Gv(n);if(n.name==="starts_with")return new Kv(n);if(n.name==="ends_with")return new Hv(n);if(n.name==="to_lower")return new Wv(n);if(n.name==="to_upper")return new Qv(n);if(n.name==="trim")return new Yv(n);if(n.name==="string_concat")return new Jv(n);if(n.name==="map_get")return new Xv(n);if(n.name==="cosine_distance")return new Zv(n);if(n.name==="dot_product")return new eA(n);if(n.name==="euclidean_distance")return new tA(n);if(n.name==="vector_length")return new nA(n);if(n.name==="unix_micros_to_timestamp")return new aA(n);if(n.name==="timestamp_to_unix_micros")return new lA(n);if(n.name==="unix_millis_to_timestamp")return new cA(n);if(n.name==="timestamp_to_unix_millis")return new hA(n);if(n.name==="unix_seconds_to_timestamp")return new uA(n);if(n.name==="timestamp_to_unix_seconds")return new dA(n);if(n.name==="timestamp_add")return new fA(n);if(n.name==="timestamp_subtract")return new pA(n)}throw new Error(`Unknown Expr : ${n}`)}class nv{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===_t)return T.newValue({referenceValue:ii(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return T.newValue({timestampValue:Ao(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return T.newValue({timestampValue:Ao(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?da(r)?T.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:Ao(i.serializer,q.fromTimestamp(qr(o)))};if(i.serverTimestampBehavior==="previous"){const c=Ri(o);if(c)return c}return{nullValue:"NULL_VALUE"}})(e,r)):T.newValue(r):T.pr()}}class rv{constructor(e){this.expr=e}evaluate(e,t){return T.newValue(this.expr._getValue())}}class sv{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.cr.map((s=>z(s).evaluate(e,t)));return r.some((s=>s.yr()))?T.mr():T.newValue({arrayValue:{values:r.map((s=>s.value))}})}}function De(n){return Hn(n)?Number(n.doubleValue):Number(n.integerValue)}function bt(n){return BigInt(n.integerValue)}const iv=BigInt("0x7fffffffffffffff"),ov=-BigInt("0x8000000000000000");class Oi{constructor(e){this.expr=e}evaluate(e,t){O(this.expr.params.length>=2,24778);const r=z(this.expr.params[0]).evaluate(e,t),s=z(this.expr.params[1]).evaluate(e,t);let i=this.br(r,s);for(const o of this.expr.params.slice(2)){const c=z(o).evaluate(e,t);i=this.br(i,c)}return i}br(e,t){if(e.yr()||t.yr())return T.mr();if(e.wr()||t.wr())return T.gr();const r=e.value,s=t.value;if(!Hn(r)&&!yt(r)||!Hn(s)&&!yt(s))return T.mr();if(Hn(r)||Hn(s)){const i=this.Sr(r,s);return i?T.newValue(i):T.mr()}if(yt(r)&&yt(s)){const i=this.vr(r,s);return i===void 0?T.mr():typeof i=="number"?T.newValue({doubleValue:i}):i<ov||i>iv?T.mr():T.newValue({integerValue:`${i}`})}return T.mr()}}function jt(n,e){return ye(n)!==ye(e)?"TYPE_MISMATCH":Ye(n)||Ye(e)?"NOT_EQ":et(n)&&et(e)?"EQ":et(n)||et(e)?"NULL":Tn(n)&&Tn(e)?(function(r,s){var o,c,u;if(((o=r.values)==null?void 0:o.length)!==((c=s.values)==null?void 0:c.length))return"NOT_EQ";let i=!1;for(let h=0;h<(((u=r.values)==null?void 0:u.length)??0);h++){const f=r.values[h],p=s.values[h];switch(jt(f,p)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:B(44609,{Dr:f,Cr:p})}}return i?"NULL":"EQ"})(n.arrayValue,e.arrayValue):hr(n)&&hr(e)||Jn(n)&&Jn(e)?(function(r,s){const i=r.fields||{},o=s.fields||{};if(Uo(i)!==Uo(o))return"NOT_EQ";let c=!1;for(const u in i)if(i.hasOwnProperty(u)){if(o[u]===void 0)return"NOT_EQ";switch(jt(i[u],o[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":c=!0}}return c?"NULL":"EQ"})(n.mapValue,e.mapValue):(function(r,s){return ut(r,s,{u:!1,i:!0,o:!0})})(n,e)?"EQ":"NOT_EQ"}class av extends Oi{vr(e,t){return bt(e)+bt(t)}Sr(e,t){return{doubleValue:De(e)+De(t)}}}class cv extends Oi{constructor(e){super(e),this.expr=e}vr(e,t){return bt(e)-bt(t)}Sr(e,t){return{doubleValue:De(e)-De(t)}}}class uv extends Oi{constructor(e){super(e),this.expr=e}vr(e,t){return bt(e)*bt(t)}Sr(e,t){return{doubleValue:De(e)*De(t)}}}class lv extends Oi{constructor(e){super(e),this.expr=e}vr(e,t){const r=bt(t);if(r!==BigInt(0))return bt(e)/r}Sr(e,t){const r=De(t);return r===0?{doubleValue:$r(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:De(e)/r}}}class hv extends Oi{constructor(e){super(e),this.expr=e}vr(e,t){const r=bt(t);if(r!==BigInt(0))return bt(e)%r}Sr(e,t){const r=De(t);if(r!==0)return{doubleValue:De(e)%r}}}class dv{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const o of this.expr.params){const c=z(o).evaluate(e,t);switch(c.type){case"BOOLEAN":if(!((i=c.value)!=null&&i.booleanValue))return T.newValue(be);break;case"NULL":s=!0;break;default:r=!0}}return r?T.mr():s?T.gr():T.newValue(Qe)}}class ba{constructor(e){this.expr=e}evaluate(e,t){var s;O(this.expr.params.length===1,9634);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return T.newValue({booleanValue:!((s=r.value)!=null&&s.booleanValue)});case"NULL":return T.gr();default:return T.mr()}}}class fv{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const o of this.expr.params){const c=z(o).evaluate(e,t);switch(c.type){case"BOOLEAN":if((i=c.value)!=null&&i.booleanValue)return T.newValue(Qe);break;case"NULL":s=!0;break;default:r=!0}}return r?T.mr():s?T.gr():T.newValue(be)}}class qu{constructor(e){this.expr=e}evaluate(e,t){var i;let r=!1,s=!1;for(const o of this.expr.params){const c=z(o).evaluate(e,t);switch(c.type){case"BOOLEAN":r=qu.xor(r,!!((i=c.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return T.mr()}}return s?T.gr():T.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class Jm{constructor(e){this.expr=e}evaluate(e,t){var o,c;O(this.expr.params.length===2,55094);let r=!1;const s=z(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return T.mr()}const i=z(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();for(const u of((c=(o=i.value)==null?void 0:o.arrayValue)==null?void 0:c.values)??[])switch(et(s.value)&&et(u)?"EQ":jt(s.value,u)){case"EQ":return T.newValue(Qe);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44608,{value:s.value,candidate:u})}return r?T.gr():T.newValue(be)}}class pv{constructor(e){this.expr=e}evaluate(e,t){return new ba(new x("not",[new x("equal_any",this.expr.params)])).evaluate(e,t)}}class mv{constructor(e){this.expr=e}evaluate(e,t){O(this.expr.params.length===1,23322);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return T.newValue(be);case"DOUBLE":return T.newValue({booleanValue:isNaN(De(r.value))});case"NULL":return T.gr();default:return T.mr()}}}class gv{constructor(e){this.expr=e}evaluate(e,t){return O(this.expr.params.length===1,50406),new ba(new x("not",[new x("is_nan",this.expr.params)])).evaluate(e,t)}}class _v{constructor(e){this.expr=e}evaluate(e,t){switch(O(this.expr.params.length===1,23123),z(this.expr.params[0]).evaluate(e,t).type){case"NULL":return T.newValue(Qe);case"UNSET":case"ERROR":return T.mr();default:return T.newValue(be)}}}class yv{constructor(e){this.expr=e}evaluate(e,t){return O(this.expr.params.length===1,23167),new ba(new x("not",[new x("is_null",this.expr.params)])).evaluate(e,t)}}class Iv{constructor(e){this.expr=e}evaluate(e,t){return O(this.expr.params.length===1,5228),z(this.expr.params[0]).evaluate(e,t).type==="ERROR"?T.newValue(Qe):T.newValue(be)}}class Ev{constructor(e){this.expr=e}evaluate(e,t){switch(O(this.expr.params.length===1,6877),z(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return T.mr();case"UNSET":return T.newValue(be);default:return T.newValue(Qe)}}}class Tv{constructor(e){this.expr=e}evaluate(e,t){var s;O(this.expr.params.length===3,11706);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(s=r.value)!=null&&s.booleanValue?z(this.expr.params[1]).evaluate(e,t):z(this.expr.params[2]).evaluate(e,t);case"NULL":return z(this.expr.params[2]).evaluate(e,t);default:return T.mr()}}}class wv{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>z(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Ue(i.value,s.value)>0?i:s}return s===void 0?T.gr():s}}class vv{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((i=>z(i).evaluate(e,t)));let s;for(const i of r)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||Ue(i.value,s.value)<0?i:s}return s===void 0?T.gr():s}}class ss{constructor(e){this.expr=e}evaluate(e,t){O(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return T.mr()}const s=z(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return T.mr()}return this.Fr(r,s)}}class Av extends ss{constructor(e){super(e),this.expr=e}Fr(e,t){if(e.wr()&&t.wr())return T.newValue(Qe);if(e.wr()||t.wr()||Ye(e.value)||Ye(t.value)||ye(e.value)!==ye(t.value))return T.newValue(be);switch(jt(e.value,t.value)){case"EQ":return T.newValue(Qe);case"NOT_EQ":return T.newValue(be);case"NULL":return T.gr();default:B(44615,{left:e,right:t})}}}class Rv extends ss{constructor(e){super(e),this.expr=e}Fr(e,t){switch(jt(e.value,t.value)){case"EQ":return T.newValue(be);case"NOT_EQ":case"TYPE_MISMATCH":return T.newValue(Qe);case"NULL":return T.gr();default:B(44614,{left:e,right:t})}}}class Pv extends ss{constructor(e){super(e),this.expr=e}Fr(e,t){return ye(e.value)!==ye(t.value)||Ye(e.value)||Ye(t.value)?T.newValue(be):T.newValue({booleanValue:Ue(e.value,t.value)<0})}}class bv extends ss{constructor(e){super(e),this.expr=e}Fr(e,t){return ye(e.value)!==ye(t.value)||Ye(e.value)||Ye(t.value)?T.newValue(be):jt(e.value,t.value)==="EQ"?T.newValue(Qe):T.newValue({booleanValue:Ue(e.value,t.value)<0})}}class Sv extends ss{constructor(e){super(e),this.expr=e}Fr(e,t){return ye(e.value)!==ye(t.value)||Ye(e.value)||Ye(t.value)?T.newValue(be):T.newValue({booleanValue:Ue(e.value,t.value)>0})}}class Vv extends ss{constructor(e){super(e),this.expr=e}Fr(e,t){return ye(e.value)!==ye(t.value)||Ye(e.value)||Ye(t.value)?T.newValue(be):jt(e.value,t.value)==="EQ"?T.newValue(Qe):T.newValue({booleanValue:Ue(e.value,t.value)>0})}}class Cv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class xv{constructor(e){this.expr=e}evaluate(e,t){var s;O(this.expr.params.length===1,216);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"ARRAY":{const i=((s=r.value.arrayValue)==null?void 0:s.values)??[];return T.newValue({arrayValue:{values:[...i].reverse()}})}default:return T.mr()}}}class Dv{constructor(e){this.expr=e}evaluate(e,t){return O(this.expr.params.length===2,52884),new Jm(new x("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class Nv{constructor(e){this.expr=e}evaluate(e,t){var u,h,f,p;O(this.expr.params.length===2,1392);let r=!1;const s=z(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}const i=z(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const o=((h=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:h.values)??[],c=((p=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:p.values)??[];for(const g of o){let P=!1;r=!1;for(const V of c){switch(et(g)&&et(V)?"EQ":jt(g,V)){case"EQ":P=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(44613,{value:V,search:g})}if(P)break}if(!P)return T.newValue(be)}return T.newValue(Qe)}}class kv{constructor(e){this.expr=e}evaluate(e,t){var u,h,f,p;O(this.expr.params.length===2,2680);let r=!1;const s=z(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}const i=z(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const o=((h=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:h.values)??[],c=((p=(f=s.value)==null?void 0:f.arrayValue)==null?void 0:p.values)??[];for(const g of c)for(const P of o)switch(et(g)&&et(P)?"EQ":jt(g,P)){case"EQ":return T.newValue(Qe);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:B(60403,{value:g,search:P})}return r?T.gr():T.newValue(be)}}class Ov{constructor(e){this.expr=e}evaluate(e,t){var s,i,o;O(this.expr.params.length===1,38605);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"ARRAY":return T.newValue({integerValue:`${((o=(i=(s=r.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:o.length)??0}`});default:return T.mr()}}}class Lv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Mv{constructor(e){this.expr=e}evaluate(e,t){var s,i;O(this.expr.params.length===1,1508);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"BYTES":{const o=(s=r.value)==null?void 0:s.bytesValue;if(typeof o=="string"){const c=he.fromBase64String(o).toUint8Array();return c.reverse(),T.newValue({bytesValue:he.fromUint8Array(c).toBase64()})}return T.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(i=r.value)==null?void 0:i.stringValue,c=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),u=Array.from(c,(h=>h.segment)).reverse();return T.newValue({stringValue:u.join("")})}default:return T.mr()}}}class Uv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Fv{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Bv{constructor(e){this.expr=e}evaluate(e,t){O(this.expr.params.length===1,19400);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return T.gr();case"STRING":{const s=(function(o){let c=0;for(let u=0;u<o.length;u++){const h=o.codePointAt(u);if(h===void 0)return;if(h<=65535)if(h>=55296&&h<=57343)if(h<=56319){const f=o.codePointAt(u+1);f!==void 0&&f>=56320&&f<=57343?(c+=1,u++):c+=1}else c+=1;else c+=1;else{if(!(h<=1114111))return;c+=1,u++}}return c})(r.value.stringValue);return s===void 0?T.mr():T.newValue({integerValue:s})}default:return T.mr()}}}class qv{constructor(e){this.expr=e}evaluate(e,t){var s,i;O(this.expr.params.length===1,8486);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const o=(s=r.value)==null?void 0:s.bytesValue;return typeof o=="string"?T.newValue({integerValue:he.fromBase64String(o).toUint8Array().length}):T.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(u){let h=0;for(let f=0;f<u.length;f++){const p=u.codePointAt(f);if(p===void 0)return;if(p>=55296&&p<=57343){if(!(p<=56319))return;{const g=u.codePointAt(f+1);if(g===void 0||!(g>=56320&&g<=57343))return;h+=4,f++}}else if(p<=127)h+=1;else if(p<=2047)h+=2;else if(p<=65535)h+=3;else{if(!(p<=1114111))return;h+=4,f++}}return h})((i=r.value)==null?void 0:i.stringValue);return o===void 0?T.mr():T.newValue({integerValue:o})}case"NULL":return T.gr();default:return T.mr()}}}class is{constructor(e){this.expr=e}evaluate(e,t){var o,c;O(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const s=z(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return T.mr()}const i=z(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return T.mr()}return r?T.gr():this.Or((o=s.value)==null?void 0:o.stringValue,(c=i.value)==null?void 0:c.stringValue)}}class $v extends is{Or(e,t){try{const r=(function(o){let c="";for(let u=0;u<o.length;u++){const h=o.charAt(u);switch(h){case"_":c+=".";break;case"%":c+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":c+="\\"+h;break;default:c+=h}}return"^"+c+"$"})(t),s=su.compile(r);return T.newValue({booleanValue:s.matches(e)})}catch(r){return ct(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),T.mr()}}}class jv extends is{Or(e,t){try{const r=su.compile(t);return T.newValue({booleanValue:r.test(e)})}catch{return ct(`Invalid regex pattern found in regex_contains: ${t}, returning error`),T.mr()}}}class zv extends is{Or(e,t){try{return T.newValue({booleanValue:su.compile(t).matches(e)})}catch{return ct(`Invalid regex pattern found in regex_match: ${t}, returning error`),T.mr()}}}class Gv extends is{Or(e,t){return T.newValue({booleanValue:e.includes(t)})}}class Kv extends is{Or(e,t){return T.newValue({booleanValue:e.startsWith(t)})}}class Hv extends is{Or(e,t){return T.newValue({booleanValue:e.endsWith(t)})}}class Wv{constructor(e){this.expr=e}evaluate(e,t){var s,i;O(this.expr.params.length===1,29079);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return T.gr();default:return T.mr()}}}class Qv{constructor(e){this.expr=e}evaluate(e,t){var s,i;O(this.expr.params.length===1,60487);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return T.gr();default:return T.mr()}}}class Yv{constructor(e){this.expr=e}evaluate(e,t){var s,i;O(this.expr.params.length===1,28544);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return T.newValue({stringValue:(i=(s=r.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return T.gr();default:return T.mr()}}}class Jv{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map((o=>z(o).evaluate(e,t)));let s="",i=!1;for(const o of r)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return T.mr()}return i?T.gr():T.newValue({stringValue:s})}}class Xv{constructor(e){this.expr=e}evaluate(e,t){var o,c,u,h;O(this.expr.params.length===2,4483);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return T.pr();case"MAP":break;default:return T.mr()}const s=z(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return T.mr();const i=(h=(c=(o=r.value)==null?void 0:o.mapValue)==null?void 0:c.fields)==null?void 0:h[(u=s.value)==null?void 0:u.stringValue];return i===void 0?T.pr():T.newValue(i)}}class $u{constructor(e){this.expr=e}evaluate(e,t){var h,f;O(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const s=z(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.mr()}const i=z(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const o=Nc(s.value),c=Nc(i.value);if(o===void 0||c===void 0||((h=o.values)==null?void 0:h.length)!==((f=c.values)==null?void 0:f.length))return T.mr();const u=this.Mr(o,c);return u===void 0||isNaN(u)?T.mr():T.newValue({doubleValue:u})}}class Zv extends $u{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return;let i=0,o=0,c=0;for(let h=0;h<r.length;h++){if(!En(r[h])||!En(s[h]))return;const f=De(r[h]),p=De(s[h]);i+=f*p,o+=f*f,c+=p*p}const u=Math.sqrt(o)*Math.sqrt(c);if(u!==0)return 1-Math.max(-1,Math.min(1,i/u))}}class eA extends $u{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!En(r[o])||!En(s[o]))return;i+=De(r[o])*De(s[o])}return i}}class tA extends $u{Mr(e,t){const r=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(r.length===0)return 0;let i=0;for(let o=0;o<r.length;o++){if(!En(r[o])||!En(s[o]))return;const c=De(r[o]),u=De(s[o]);i+=Math.pow(c-u,2)}return Math.sqrt(i)}}class nA{constructor(e){this.expr=e}evaluate(e,t){var s;O(this.expr.params.length===1,39044);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const i=Nc(r.value);return T.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return T.gr();default:return T.mr()}}}const ci=BigInt(-62135596800),ui=BigInt(253402300799),Ho=BigInt(1e3),yn=BigInt(1e6),rA=ci*Ho,sA=ui*Ho+BigInt(999),iA=ci*yn,oA=ui*yn+BigInt(999999);function ju(n){return n>=iA&&n<=oA}function Xm(n){return n>=ci&&n<=ui}function li(n,e){const t=BigInt(n);return!(t<ci||t>ui)&&!(e<0||e>=1e9)&&(t!==ci||e===0)&&!(t===ui&&e>999999999)}function Zm(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function zu(n){return BigInt(n.seconds)*yn+BigInt(Math.trunc(n.nanoseconds/1e3))}class Gu{constructor(e){this.expr=e}evaluate(e,t){O(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return T.gr();default:return T.mr()}}}class aA extends Gu{toTimestamp(e){if(!ju(e))return T.mr();let t=Number(e/yn),r=Number(e%yn*BigInt(1e3));const s=Zm(t,r);return t=s.seconds,r=s.nanos,li(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.mr()}}class cA extends Gu{toTimestamp(e){if(!(function(o){return o>=rA&&o<=sA})(e))return T.mr();let t=Number(e/Ho),r=Number(e%Ho*BigInt(1e6));const s=Zm(t,r);return t=s.seconds,r=s.nanos,li(t,r)?T.newValue({timestampValue:{seconds:t,nanos:r}}):T.mr()}}class uA extends Gu{toTimestamp(e){if(!Xm(e))return T.mr();const t=Number(e);return T.newValue({timestampValue:{seconds:t,nanos:0}})}}class Ku{constructor(e){this.expr=e}evaluate(e,t){O(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=z(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return T.gr();default:return T.mr()}const s=Vu(r.value.timestampValue);return li(s.seconds,s.nanoseconds)?this.Nr(s):T.mr()}}class lA extends Ku{Nr(e){const t=zu(e);return ju(t)?T.newValue({integerValue:`${t.toString()}`}):T.mr()}}class hA extends Ku{Nr(e){const t=zu(e),r=t/BigInt(1e3),s=t%BigInt(1e3);return r>BigInt(0)||s===BigInt(0)?T.newValue({integerValue:r.toString()}):T.newValue({integerValue:(r-BigInt(1)).toString()})}}class dA extends Ku{Nr(e){const t=BigInt(e.seconds);return Xm(t)?T.newValue({integerValue:t.toString()}):T.mr()}}class eg{constructor(e){this.expr=e}evaluate(e,t){O(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const s=z(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return T.mr()}const i=z(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(K){switch(K){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return T.mr();break;case"NULL":r=!0;break;default:return T.mr()}const c=z(this.expr.params[2]).evaluate(e,t);switch(c.type){case"INT":break;case"NULL":r=!0;break;default:return T.mr()}if(r)return T.gr();const u=BigInt(c.value.integerValue);let h;try{switch(o){case"microsecond":h=u;break;case"millisecond":h=u*BigInt(1e3);break;case"second":h=u*BigInt(1e6);break;case"minute":h=u*BigInt(6e7);break;case"hour":h=u*BigInt(36e8);break;case"day":h=u*BigInt(864e8);break;default:return T.mr()}if(o!=="microsecond"&&u!==BigInt(0)&&h/u!==BigInt(this.Lr(o)))return T.mr()}catch($){return ct(`Error during timestamp arithmetic: ${$}`),T.mr()}const f=Vu(s.value.timestampValue);if(!li(f.seconds,f.nanoseconds))return T.mr();const p=zu(f),g=this.Br(p,h);if(!ju(g))return T.mr();const P=Number(g/yn),V=g%yn,L=Number((V<0?V+yn:V)*BigInt(1e3)),k=V<0?P-1:P;return li(k,L)?T.newValue({timestampValue:{seconds:k,nanos:L}}):T.mr()}Lr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class fA extends eg{Br(e,t){return e+t}}class pA extends eg{Br(e,t){return e-t}}function hi(n){if((n=Ym(n))instanceof yr)return`fld(${n.fieldName})`;if(n instanceof Ir)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof pe?`ref(${t.path})`:t instanceof We?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(n.value)})`;if(n instanceof x)return`fn(${n.name},[${n.params.map(hi).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.cr.map(hi).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function mA(n){if(n instanceof Hm)return`${n._name}(${ao(n.fields)})`;if(n instanceof Wm){let e=`${n._name}(${ao(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${ao(n.groups)})`),e}if(n instanceof Qm)return`${n._name}(${ao(n.groups)})`;if(n instanceof xi)return`${n._name}(${n.hr})`;if(n instanceof Di)return`${n._name}(${n.collectionId})`;if(n instanceof Ra)return`${n._name}()`;if(n instanceof Pa)return`${n._name}(${n.Tr.sort()})`;if(n instanceof Ni)return`${n._name}(${hi(n.condition)})`;if(n instanceof An)return`${n._name}(${n.limit})`;if(n instanceof It)return`${n._name}(${(function(t){return t.map((r=>`${hi(r.expr)}${r.direction}`)).join(",")})(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function ao(n){return`${Array.from(n.entries()).sort().map((([e,t])=>`${e}=${hi(t)}`)).join(",")}`}function Mt(n){return n.stages.map((e=>mA(e))).join("|")}function tg(n,e){return Mt(n)===Mt(e)}function ge(n){return n instanceof Le}function Ud(n){return ge(n)?Mt(n):Bs(n)}function ng(n){return ge(n)?Mt(n):(function(t){return`${$o(ot(t))}|lt:${t.limitType}`})(n)}function Sa(n,e){return n instanceof Le&&e instanceof Le?tg(n,e):!(n instanceof Le&&!(e instanceof Le)||!(n instanceof Le)&&e instanceof Le)&&qT(n,e)}function Va(n){return hn(n)?Mt(n):$o(n)}function Hu(n,e){return n instanceof Le&&e instanceof Le?tg(n,e):!(n instanceof Le&&!(e instanceof Le)||!(n instanceof Le)&&e instanceof Le)&&Ru(n,e)}function gA(n,e){const t=(function(s){let i=!1;const o=[];for(const c of s)if(c instanceof It)if(i=!0,c.orderings.some((u=>u.expr instanceof yr&&u.expr.fieldName===_t)))o.push(c);else{const u=c.orderings.map((h=>h));u.push(Ro(_t).ascending()),o.push(new It(u,{}))}else c instanceof An&&(i||(o.push(new It([Ro(_t).ascending()],{})),i=!0)),o.push(c);return i||o.push(new It([Ro(_t).ascending()],{})),o})(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(r)))}return new Le(n.userDataReader.serializer,t,e)}/**
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
 */class Wu{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&PT(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Us(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Us(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=cm();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(s.key)?null:c;const u=Hp(o,c);u!==null&&r.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(q.min())})),r}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),Q())}isEqual(e){return this.batchId===e.batchId&&Br(this.mutations,e.mutations,((t,r)=>fd(t,r)))&&Br(this.baseMutations,e.baseMutations,((t,r)=>fd(t,r)))}}class Qu{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){O(e.mutations.length===r.length,58842,{Ur:e.mutations.length,kr:r.length});let s=(function(){return KT})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new Qu(e,t,r,s)}}/**
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
 */const Wo="";function Me(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Fd(e)),e=_A(n.get(t),e);return Fd(e)}function _A(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case Wo:t+="";break;default:t+=i}}return t}function Fd(n){return n+Wo+""}function Et(n){const e=n.length;if(O(e>=2,64408,{path:n}),e===2)return O(n.charAt(0)===Wo&&n.charAt(1)==="",56145,{path:n}),Z.emptyPath();const t=e-2,r=[];let s="";for(let i=0;i<e;){const o=n.indexOf(Wo,i);switch((o<0||o>t)&&B(50515,{path:n}),n.charAt(o+1)){case"":const c=n.substring(i,o);let u;s.length===0?u=c:(s+=c,u=s,s=""),r.push(u);break;case"":s+=n.substring(i,o),s+="\0";break;case"":s+=n.substring(i,o+1);break;default:B(61167,{path:n})}i=o+2}return new Z(r)}/**
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
 */const qn="remoteDocuments",Li="owner",Rr="owner",di="mutationQueues",yA="userId",lt="mutations",Bd="batchId",Wn="userMutationsIndex",qd=["userId","batchId"];/**
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
 */function Po(n,e){return[n,Me(e)]}function rg(n,e,t){return[n,Me(e),t]}const IA={},Qr="documentMutations",Qo="remoteDocumentsV14",EA=["prefixPath","collectionGroup","readTime","documentId"],bo="documentKeyIndex",TA=["prefixPath","collectionGroup","documentId"],sg="collectionGroupIndex",wA=["collectionGroup","readTime","prefixPath","documentId"],fi="remoteDocumentGlobal",Gc="remoteDocumentGlobalKey",Yr="targets",ig="queryTargetsIndex",vA=["canonicalId","targetId"],Jr="targetDocuments",AA=["targetId","path"],Yu="documentTargetsIndex",RA=["path","targetId"],Yo="targetGlobalKey",er="targetGlobal",pi="collectionParents",PA=["collectionId","parent"],Xr="clientMetadata",bA="clientId",Ca="bundles",SA="bundleId",xa="namedQueries",VA="name",Ju="indexConfiguration",CA="indexId",Kc="collectionGroupIndex",xA="collectionGroup",Gs="indexState",DA=["indexId","uid"],og="sequenceNumberIndex",NA=["uid","sequenceNumber"],Ks="indexEntries",kA=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],ag="documentKeyIndex",OA=["indexId","uid","orderedDocumentKey"],Da="documentOverlays",LA=["userId","collectionPath","documentId"],Hc="collectionPathOverlayIndex",MA=["userId","collectionPath","largestBatchId"],cg="collectionGroupOverlayIndex",UA=["userId","collectionGroup","largestBatchId"],Xu="globals",FA="name",ug=[di,lt,Qr,qn,Yr,Li,er,Jr,Xr,fi,pi,Ca,xa],BA=[...ug,Da],lg=[di,lt,Qr,Qo,Yr,Li,er,Jr,Xr,fi,pi,Ca,xa,Da],hg=lg,Zu=[...hg,Ju,Gs,Ks],qA=Zu,dg=[...Zu,Xu],$A=dg;/**
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
 */function fg(n,e,t){const r=n.store(lt),s=n.store(Qr),i=[],o=IDBKeyRange.only(t.batchId);let c=0;const u=r.Hn({range:o},((f,p,g)=>(c++,g.delete())));i.push(u.next((()=>{O(c===1,47070,{batchId:t.batchId})})));const h=[];for(const f of t.mutations){const p=rg(e,f.key.path,t.batchId);i.push(s.delete(p)),h.push(f.key)}return A.waitFor(i).next((()=>h))}function Jo(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw B(14731);e=n.noDocument}return JSON.stringify(e).length}/**
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
 */class Wc extends xm{constructor(e,t){super(),this.qr=e,this.currentSequenceNumber=t}}function Ae(n,e){const t=W(n);return mn.Cn(t.qr,e)}/**
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
 */class el{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class Tt{constructor(e,t,r,s,i=q.min(),o=q.min(),c=he.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new Tt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Tt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Tt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Tt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class pg{constructor(e){this.$r=e}}function jA(n,e){let t;if(e.document)t=rw(n.$r,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=F.fromSegments(e.noDocument.path),s=pr(e.noDocument.readTime);t=fe.newNoDocument(r,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return B(56709);{const r=F.fromSegments(e.unknownDocument.path),s=pr(e.unknownDocument.version);t=fe.newUnknownDocument(r,s)}}return e.readTime&&t.setReadTime((function(s){const i=new se(s[0],s[1]);return q.fromTimestamp(i)})(e.readTime)),t}function $d(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Xo(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=(function(i,o){return{name:ii(i,o.key),fields:o.data.value.mapValue.fields,updateTime:Xn(i,o.version.toTimestamp()),createTime:Xn(i,o.createTime.toTimestamp())}})(n.$r,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:fr(e.version)};else{if(!e.isUnknownDocument())return B(57904,{document:e});r.unknownDocument={path:t.path.toArray(),version:fr(e.version)}}return r}function Xo(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function fr(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function pr(n){const e=new se(n.seconds,n.nanoseconds);return q.fromTimestamp(e)}function jn(n,e){const t=(e.baseMutations||[]).map((i=>$c(n.$r,i)));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const c=e.mutations[i+1];o.updateTransforms=c.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const r=e.mutations.map((i=>$c(n.$r,i))),s=se.fromMillis(e.localWriteTimeMs);return new Wu(e.batchId,s,t,r)}function ks(n,e){const t=pr(e.readTime),r=e.lastLimboFreeSnapshotVersion!==void 0?pr(e.lastLimboFreeSnapshotVersion):q.min();let s;return s=(function(o){return o.structuredPipeline!==void 0})(e.query)?(function(o,c){var f,p;const u=o.structuredPipeline;O((((f=u==null?void 0:u.pipeline)==null?void 0:f.stages)??[]).length>0,1845);const h=(p=u==null?void 0:u.pipeline)==null?void 0:p.stages.map(zA);return new Le(c,h)})(e.query,n.$r):(function(o){return o.documents!==void 0})(e.query)?(function(o){const c=o.documents.length;return O(c===1,1966,{count:c}),ot(bi(pm(o.documents[0])))})(e.query):(function(o){return ot(ym(o))})(e.query),new Tt(s,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,r,he.fromBase64String(e.resumeToken))}function mg(n,e){const t=fr(e.snapshotVersion),r=fr(e.lastLimboFreeSnapshotVersion);let s;s=hn(e.target)?Im(n.$r,e.target):Pu(e.target)?gm(n.$r,e.target):_m(n.$r,e.target).Se;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:Va(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:s}}function gg(n){const e=ym({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?zo(e,e.limit,"L"):e}function co(n,e){return new el(e.largestBatchId,$c(n.$r,e.overlayMutation))}function jd(n,e){const t=e.path.lastSegment();return[n,Me(e.path.popLast()),t]}function zd(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:fr(r.readTime),documentKey:Me(r.documentKey.path),largestBatchId:r.largestBatchId}}function zA(n){switch(n.name){case"collection":return new xi(n.args[0].referenceValue,{});case"collection_group":return new Di(n.args[1].stringValue,{});case"database":return new Ra({});case"documents":return new Pa(n.args.map((e=>e.referenceValue)),{});case"where":return new Ni(Qc(n.args[0]),{});case"limit":{const e=n.args[0].integerValue??n.args[0].doubleValue;return new An(typeof e=="number"?e:Number(e),{})}case"sort":return new It(n.args.map((e=>(function(r){var i,o;const s=(i=r.mapValue)==null?void 0:i.fields;return new Uu(Qc(s.expression),(o=s.direction)==null?void 0:o.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${n.name} not supported.`)}}function Qc(n){return n.fieldReferenceValue?new yr($t("_exprFromProto",n.fieldReferenceValue),"_exprFromProto"):n.functionValue?(function(t){var r;return new x(t.functionValue.name,((r=t.functionValue.args)==null?void 0:r.map(Qc))||[])})(n):Ir._fromProto(n)}class Na{constructor(e,t,r,s){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=s,this.Kr={}}static Qr(e,t,r,s){O(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new Na(i,t,r,s)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return tn(e).Hn({index:Wn,range:r},((s,i,o)=>{t=!1,o.done()})).next((()=>t))}addMutationBatch(e,t,r,s){const i=Lr(e),o=tn(e);return o.add({}).next((c=>{O(typeof c=="number",49019);const u=new Wu(c,t,r,s),h=(function(P,V,L){const k=L.baseMutations.map((K=>Go(P.$r,K))),$=L.mutations.map((K=>Go(P.$r,K)));return{userId:V,batchId:L.batchId,localWriteTimeMs:L.localWriteTime.toMillis(),baseMutations:k,mutations:$}})(this.serializer,this.userId,u),f=[];let p=new ie(((g,P)=>H(g.canonicalString(),P.canonicalString())));for(const g of s){const P=rg(this.userId,g.key.path,c);p=p.add(g.key.path.popLast()),f.push(o.put(h)),f.push(i.put(P,IA))}return p.forEach((g=>{f.push(this.indexManager.addToCollectionParentIndex(e,g))})),e.addOnCommittedListener((()=>{this.Kr[c]=u.keys()})),A.waitFor(f).next((()=>u))}))}lookupMutationBatch(e,t){return tn(e).get(t).next((r=>r?(O(r.userId===this.userId,48,"Unexpected user for mutation batch",{userId:r.userId,batchId:t}),jn(this.serializer,r)):null))}Wr(e,t){return this.Kr[t]?A.resolve(this.Kr[t]):this.lookupMutationBatch(e,t).next((r=>{if(r){const s=r.keys();return this.Kr[t]=s,s}return null}))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=IDBKeyRange.lowerBound([this.userId,r]);let i=null;return tn(e).Hn({index:Wn,range:s},((o,c,u)=>{c.userId===this.userId&&(O(c.batchId>=r,47524,{Gr:r}),i=jn(this.serializer,c)),u.done()})).next((()=>i))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=Yn;return tn(e).Hn({index:Wn,range:t,reverse:!0},((s,i,o)=>{r=i.batchId,o.done()})).next((()=>r))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,Yn],[this.userId,Number.POSITIVE_INFINITY]);return tn(e).Qn(Wn,t).next((r=>r.map((s=>jn(this.serializer,s)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=Po(this.userId,t.path),s=IDBKeyRange.lowerBound(r),i=[];return Lr(e).Hn({range:s},((o,c,u)=>{const[h,f,p]=o,g=Et(f);if(h===this.userId&&t.path.isEqual(g))return tn(e).get(p).next((P=>{if(!P)throw B(61480,{zr:o,batchId:p});O(P.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:P.userId,batchId:p}),i.push(jn(this.serializer,P))}));u.done()})).next((()=>i))}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ie(H);const s=[];return t.forEach((i=>{const o=Po(this.userId,i.path),c=IDBKeyRange.lowerBound(o),u=Lr(e).Hn({range:c},((h,f,p)=>{const[g,P,V]=h,L=Et(P);g===this.userId&&i.path.isEqual(L)?r=r.add(V):p.done()}));s.push(u)})),A.waitFor(s).next((()=>this.jr(e,r)))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1,i=Po(this.userId,r),o=IDBKeyRange.lowerBound(i);let c=new ie(H);return Lr(e).Hn({range:o},((u,h,f)=>{const[p,g,P]=u,V=Et(g);p===this.userId&&r.isPrefixOf(V)?V.length===s&&(c=c.add(P)):f.done()})).next((()=>this.jr(e,c)))}jr(e,t){const r=[],s=[];return t.forEach((i=>{s.push(tn(e).get(i).next((o=>{if(o===null)throw B(35274,{batchId:i});O(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),r.push(jn(this.serializer,o))})))})),A.waitFor(s).next((()=>r))}removeMutationBatch(e,t){return fg(e.qr,this.userId,t).next((r=>(e.addOnCommittedListener((()=>{this.Hr(t.batchId)})),A.forEach(r,(s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))))}Hr(e){delete this.Kr[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return A.resolve();const r=IDBKeyRange.lowerBound((function(o){return[o]})(this.userId)),s=[];return Lr(e).Hn({range:r},((i,o,c)=>{if(i[0]===this.userId){const u=Et(i[1]);s.push(u)}else c.done()})).next((()=>{O(s.length===0,56720,{Jr:s.map((i=>i.canonicalString()))})}))}))}containsKey(e,t){return _g(e,this.userId,t)}Yr(e){return yg(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:Yn,lastStreamToken:""}))}}function _g(n,e,t){const r=Po(e,t.path),s=r[1],i=IDBKeyRange.lowerBound(r);let o=!1;return Lr(n).Hn({range:i,jn:!0},((c,u,h)=>{const[f,p,g]=c;f===e&&p===s&&(o=!0),h.done()})).next((()=>o))}function tn(n){return Ae(n,lt)}function Lr(n){return Ae(n,Qr)}function yg(n){return Ae(n,di)}/**
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
 */class GA{getBundleMetadata(e,t){return Gd(e).get(t).next((r=>{if(r)return(function(i){return{id:i.bundleId,createTime:pr(i.createTime),version:i.version}})(r)}))}saveBundleMetadata(e,t){return Gd(e).put((function(s){return{bundleId:s.id,createTime:fr(je(s.createTime)),version:s.version}})(t))}getNamedQuery(e,t){return Kd(e).get(t).next((r=>{if(r)return(function(i){return{name:i.name,query:gg(i.bundledQuery),readTime:pr(i.readTime)}})(r)}))}saveNamedQuery(e,t){return Kd(e).put((function(s){return{name:s.name,readTime:fr(je(s.readTime)),bundledQuery:s.bundledQuery}})(t))}}function Gd(n){return Ae(n,Ca)}function Kd(n){return Ae(n,xa)}/**
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
 */class ka{constructor(e,t){this.serializer=e,this.userId=t}static Qr(e,t){const r=t.uid||"";return new ka(e,r)}getOverlay(e,t){return Pr(e).get(jd(this.userId,t)).next((r=>r?co(this.serializer,r):null))}getOverlays(e,t){const r=rt();return A.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=rt();return Pr(e).Hn(((s,i)=>{const o=co(this.serializer,i);o.largestBatchId>t&&r.set(o.getKey(),o)})).next((()=>r))}saveOverlays(e,t,r){const s=[];return r.forEach(((i,o)=>{const c=new el(t,o);s.push(this.Zr(e,c))})),A.waitFor(s)}removeOverlaysForBatchId(e,t,r){const s=new Set;t.forEach((o=>s.add(Me(o.getCollectionPath()))));const i=[];return s.forEach((o=>{const c=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);i.push(Pr(e).zn(Hc,c))})),A.waitFor(i)}getOverlaysForCollection(e,t,r){const s=rt(),i=Me(t),o=IDBKeyRange.bound([this.userId,i,r],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Pr(e).Qn(Hc,o).next((c=>{for(const u of c){const h=co(this.serializer,u);s.set(h.getKey(),h)}return s}))}getOverlaysForCollectionGroup(e,t,r,s){const i=rt();let o;const c=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Pr(e).Hn({index:cg,range:c},((u,h,f)=>{const p=co(this.serializer,h);i.size()<s||p.largestBatchId===o?(i.set(p.getKey(),p),o=p.largestBatchId):f.done()})).next((()=>i))}Zr(e,t){return Pr(e).put((function(s,i,o){const[c,u,h]=jd(i,o.mutation.key);return{userId:i,collectionPath:u,documentId:h,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:Go(s.$r,o.mutation)}})(this.serializer,this.userId,t))}}function Pr(n){return Ae(n,Da)}/**
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
 */class KA{Xr(e){return Ae(e,Xu)}getSessionToken(e){return this.Xr(e).get("sessionToken").next((t=>{const r=t==null?void 0:t.value;return r?he.fromUint8Array(r):he.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Xr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
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
 */class zn{constructor(){}ei(e,t){this.ti(e,t),t.ni()}ti(e,t){if("nullValue"in e)this.ri(t,5);else if("booleanValue"in e)this.ri(t,10),t.ii(e.booleanValue?1:0);else if("integerValue"in e)this.ri(t,15),t.ii(ce(e.integerValue));else if("doubleValue"in e){const r=ce(e.doubleValue);isNaN(r)?this.ri(t,13):(this.ri(t,15),$r(r)?t.ii(0):t.ii(r))}else if("timestampValue"in e){let r=e.timestampValue;this.ri(t,20),typeof r=="string"&&(r=Bt(r)),t.si(`${r.seconds||""}`),t.ii(r.nanos||0)}else if("stringValue"in e)this._i(e.stringValue,t),this.oi(t);else if("bytesValue"in e)this.ri(t,30),t.ai(qt(e.bytesValue)),this.oi(t);else if("referenceValue"in e)this.ui(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.ri(t,45),t.ii(r.latitude||0),t.ii(r.longitude||0)}else"mapValue"in e?Bp(e)?this.ri(t,Number.MAX_SAFE_INTEGER):hr(e)?this.ci(e.mapValue,t):(this.li(e.mapValue,t),this.oi(t)):"arrayValue"in e?(this.Ei(e.arrayValue,t),this.oi(t)):B(19022,{hi:e})}_i(e,t){this.ri(t,25),this.Ti(e,t)}Ti(e,t){t.si(e)}li(e,t){const r=e.fields||{};this.ri(t,55);for(const s of Object.keys(r))this._i(s,t),this.ti(r[s],t)}ci(e,t){var o,c;const r=e.fields||{};this.ri(t,53);const s=lr,i=((c=(o=r[s].arrayValue)==null?void 0:o.values)==null?void 0:c.length)||0;this.ri(t,15),t.ii(ce(i)),this._i(s,t),this.ti(r[s],t)}Ei(e,t){const r=e.values||[];this.ri(t,50);for(const s of r)this.ti(s,t)}ui(e,t){this.ri(t,37),F.fromName(e).path.forEach((r=>{this.ri(t,60),this.Ti(r,t)}))}ri(e,t){e.ii(t)}oi(e){e.ii(2)}}zn.Pi=new zn;/**
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
 */const br=255;function HA(n){if(n===0)return 8;let e=0;return n>>4||(e+=4,n<<=4),n>>6||(e+=2,n<<=2),n>>7||(e+=1),e}function Hd(n){const e=64-(function(r){let s=0;for(let i=0;i<8;++i){const o=HA(255&r[i]);if(s+=o,o!==8)break}return s})(n);return Math.ceil(e/8)}class WA{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Ii(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ri(r.value),r=t.next();this.Ai()}Vi(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.di(r.value),r=t.next();this.fi()}mi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ri(r);else if(r<2048)this.Ri(960|r>>>6),this.Ri(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ri(480|r>>>12),this.Ri(128|63&r>>>6),this.Ri(128|63&r);else{const s=t.codePointAt(0);this.Ri(240|s>>>18),this.Ri(128|63&s>>>12),this.Ri(128|63&s>>>6),this.Ri(128|63&s)}}this.Ai()}pi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.di(r);else if(r<2048)this.di(960|r>>>6),this.di(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.di(480|r>>>12),this.di(128|63&r>>>6),this.di(128|63&r);else{const s=t.codePointAt(0);this.di(240|s>>>18),this.di(128|63&s>>>12),this.di(128|63&s>>>6),this.di(128|63&s)}}this.fi()}gi(e){const t=this.yi(e),r=Hd(t);this.wi(1+r),this.buffer[this.position++]=255&r;for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=255&t[s]}bi(e){const t=this.yi(e),r=Hd(t);this.wi(1+r),this.buffer[this.position++]=~(255&r);for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}Si(){this.Di(br),this.Di(255)}xi(){this.Ci(br),this.Ci(255)}reset(){this.position=0}seed(e){this.wi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Fi(){return this.buffer.slice(0,this.position)}yi(e){const t=(function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)})(e),r=!!(128&t[0]);t[0]^=r?255:128;for(let s=1;s<t.length;++s)t[s]^=r?255:0;return t}Ri(e){const t=255&e;t===0?(this.Di(0),this.Di(255)):t===br?(this.Di(br),this.Di(0)):this.Di(t)}di(e){const t=255&e;t===0?(this.Ci(0),this.Ci(255)):t===br?(this.Ci(br),this.Ci(0)):this.Ci(e)}Ai(){this.Di(0),this.Di(1)}fi(){this.Ci(0),this.Ci(1)}Di(e){this.wi(1),this.buffer[this.position++]=e}Ci(e){this.wi(1),this.buffer[this.position++]=~e}wi(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const s=new Uint8Array(r);s.set(this.buffer),this.buffer=s}}class QA{constructor(e){this.Oi=e}ai(e){this.Oi.Ii(e)}si(e){this.Oi.mi(e)}ii(e){this.Oi.gi(e)}ni(){this.Oi.Si()}}class YA{constructor(e){this.Oi=e}ai(e){this.Oi.Vi(e)}si(e){this.Oi.pi(e)}ii(e){this.Oi.bi(e)}ni(){this.Oi.xi()}}class Rs{constructor(){this.Oi=new WA,this.ascending=new QA(this.Oi),this.descending=new YA(this.Oi)}seed(e){this.Oi.seed(e)}Mi(e){return e===0?this.ascending:this.descending}Fi(){return this.Oi.Fi()}reset(){this.Oi.reset()}}/**
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
 */class Gn{constructor(e,t,r,s){this.Ni=e,this.Li=t,this.Bi=r,this.Ui=s}ki(){const e=this.Ui.length,t=e===0||this.Ui[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.Ui,0),t!==e?r.set([0],this.Ui.length):++r[r.length-1],new Gn(this.Ni,this.Li,this.Bi,r)}qi(e,t,r){return{indexId:this.Ni,uid:e,arrayValue:So(this.Bi),directionalValue:So(this.Ui),orderedDocumentKey:So(t),documentKey:r.path.toArray()}}$i(e,t,r){const s=this.qi(e,t,r);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function nn(n,e){let t=n.Ni-e.Ni;return t!==0?t:(t=Wd(n.Bi,e.Bi),t!==0?t:(t=Wd(n.Ui,e.Ui),t!==0?t:F.comparator(n.Li,e.Li)))}function Wd(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}function So(n){return Uf()?(function(t){let r="";for(let s=0;s<t.length;s++)r+=String.fromCharCode(t[s]);return r})(n):n}function Qd(n){return typeof n!="string"?n:(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(n)}class Yd{constructor(e){this.Ki=new ie(((t,r)=>Te.comparator(t.field,r.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Qi=e.orderBy,this.Wi=[];for(const t of e.filters){const r=t;r.isInequality()?this.Ki=this.Ki.add(r):this.Wi.push(r)}}get Gi(){return this.Ki.size>1}zi(e){if(O(e.collectionGroup===this.collectionId,49279),this.Gi)return!1;const t=Lc(e);if(t!==void 0&&!this.ji(t))return!1;const r=Bn(e);let s=new Set,i=0,o=0;for(;i<r.length&&this.ji(r[i]);++i)s=s.add(r[i].fieldPath.canonicalString());if(i===r.length)return!0;if(this.Ki.size>0){const c=this.Ki.getIterator().getNext();if(!s.has(c.field.canonicalString())){const u=r[i];if(!this.Hi(c,u)||!this.Ji(this.Qi[o++],u))return!1}++i}for(;i<r.length;++i){const c=r[i];if(o>=this.Qi.length||!this.Ji(this.Qi[o++],c))return!1}return!0}Yi(){if(this.Gi)return null;let e=new ie(Te.comparator);const t=[];for(const r of this.Wi)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new wo(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new wo(r.field,0))}for(const r of this.Qi)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new wo(r.field,r.dir==="asc"?0:1)));return new qo(qo.UNKNOWN_ID,this.collectionId,t,si.empty())}ji(e){for(const t of this.Wi)if(this.Hi(t,e))return!0;return!1}Hi(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}Ji(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
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
 */function Ig(n){var t,r;if(O(n instanceof ne||n instanceof oe,20012),n instanceof ne){if(n instanceof nm){const s=((r=(t=n.value.arrayValue)==null?void 0:t.values)==null?void 0:r.map((i=>ne.create(n.field,"==",i))))||[];return oe.create(s,"or")}return n}const e=n.filters.map((s=>Ig(s)));return oe.create(e,n.op)}function JA(n){if(n.getFilters().length===0)return[];const e=Xc(Ig(n));return O(Eg(e),7391),Yc(e)||Jc(e)?[e]:e.getFilters()}function Yc(n){return n instanceof ne}function Jc(n){return n instanceof oe&&vu(n)}function Eg(n){return Yc(n)||Jc(n)||(function(t){if(t instanceof oe&&kc(t)){for(const r of t.getFilters())if(!Yc(r)&&!Jc(r))return!1;return!0}return!1})(n)}function Xc(n){if(O(n instanceof ne||n instanceof oe,34018),n instanceof ne)return n;if(n.filters.length===1)return Xc(n.filters[0]);const e=n.filters.map((r=>Xc(r)));let t=oe.create(e,n.op);return t=Zo(t),Eg(t)?t:(O(t instanceof oe,64498),O(Wr(t),40251),O(t.filters.length>1,57927),t.filters.reduce(((r,s)=>tl(r,s))))}function tl(n,e){let t;return O(n instanceof ne||n instanceof oe,38388),O(e instanceof ne||e instanceof oe,25473),t=n instanceof ne?e instanceof ne?(function(s,i){return oe.create([s,i],"and")})(n,e):Jd(n,e):e instanceof ne?Jd(e,n):(function(s,i){if(O(s.filters.length>0&&i.filters.length>0,48005),Wr(s)&&Wr(i))return Zp(s,i.getFilters());const o=kc(s)?s:i,c=kc(s)?i:s,u=o.filters.map((h=>tl(h,c)));return oe.create(u,"or")})(n,e),Zo(t)}function Jd(n,e){if(Wr(e))return Zp(e,n.getFilters());{const t=e.filters.map((r=>tl(n,r)));return oe.create(t,"or")}}function Zo(n){if(O(n instanceof ne||n instanceof oe,11850),n instanceof ne)return n;const e=n.getFilters();if(e.length===1)return Zo(e[0]);if(Jp(n))return n;const t=e.map((s=>Zo(s))),r=[];return t.forEach((s=>{s instanceof ne?r.push(s):s instanceof oe&&(s.op===n.op?r.push(...s.filters):r.push(s))})),r.length===1?r[0]:oe.create(r,n.op)}/**
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
 */class XA{constructor(){this.Zi=new nl}addToCollectionParentIndex(e,t){return this.Zi.add(t),A.resolve()}getCollectionParents(e,t){return A.resolve(this.Zi.getEntries(t))}addFieldIndex(e,t){return A.resolve()}deleteFieldIndex(e,t){return A.resolve()}deleteAllFieldIndexes(e){return A.resolve()}createTargetIndexes(e,t){return A.resolve()}getDocumentsMatchingTarget(e,t){return A.resolve(null)}getIndexType(e,t){return A.resolve(0)}getFieldIndexes(e,t){return A.resolve([])}getNextCollectionGroupToUpdate(e){return A.resolve(null)}getMinOffset(e,t){return A.resolve(tt.min())}getMinOffsetFromCollectionGroup(e,t){return A.resolve(tt.min())}updateCollectionGroup(e,t,r){return A.resolve()}updateIndexEntries(e,t){return A.resolve()}}class nl{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new ie(Z.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new ie(Z.comparator)).toArray()}}/**
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
 */const Xd="IndexedDbIndexManager",uo=new Uint8Array(0);class ZA{constructor(e,t){this.databaseId=t,this.Xi=new nl,this.es=new Kt((r=>$o(r)),((r,s)=>Ru(r,s))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Xi.has(t)){const r=t.lastSegment(),s=t.popLast();e.addOnCommittedListener((()=>{this.Xi.add(t)}));const i={collectionId:r,parent:Me(s)};return Zd(e).put(i)}return A.resolve()}getCollectionParents(e,t){const r=[],s=IDBKeyRange.bound([t,""],[xp(t),""],!1,!0);return Zd(e).Qn(s).next((i=>{for(const o of i){if(o.collectionId!==t)break;r.push(Et(o.parent))}return r}))}addFieldIndex(e,t){const r=Ps(e),s=(function(c){return{indexId:c.indexId,collectionGroup:c.collectionGroup,fields:c.fields.map((u=>[u.fieldPath.canonicalString(),u.kind]))}})(t);delete s.indexId;const i=r.add(s);if(t.indexState){const o=Vr(e);return i.next((c=>{o.put(zd(c,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return i.next()}deleteFieldIndex(e,t){const r=Ps(e),s=Vr(e),i=Sr(e);return r.delete(t.indexId).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=Ps(e),r=Sr(e),s=Vr(e);return t.zn().next((()=>r.zn())).next((()=>s.zn()))}createTargetIndexes(e,t){return A.forEach(this.ts(t),(r=>this.getIndexType(e,r).next((s=>{if(s===0||s===1){const i=new Yd(r).Yi();if(i!=null)return this.addFieldIndex(e,i)}}))))}getDocumentsMatchingTarget(e,t){const r=Sr(e);let s=!0;const i=new Map;return A.forEach(this.ts(t),(o=>this.ns(e,o).next((c=>{s&&(s=!!c),i.set(o,c)})))).next((()=>{if(s){let o=Q();const c=[];return A.forEach(i,((u,h)=>{D(Xd,`Using index ${(function(j){return`id=${j.indexId}|cg=${j.collectionGroup}|f=${j.fields.map((X=>`${X.fieldPath}:${X.kind}`)).join(",")}`})(u)} to execute ${$o(t)}`);const f=(function(j,X){const J=Lc(X);if(J===void 0)return null;for(const ee of jo(j,J.fieldPath))switch(ee.op){case"array-contains-any":return ee.value.arrayValue.values||[];case"array-contains":return[ee.value]}return null})(h,u),p=(function(j,X){const J=new Map;for(const ee of Bn(X))for(const E of jo(j,ee.fieldPath))switch(E.op){case"==":case"in":J.set(ee.fieldPath.canonicalString(),E.value);break;case"not-in":case"!=":return J.set(ee.fieldPath.canonicalString(),E.value),Array.from(J.values())}return null})(h,u),g=(function(j,X){const J=[];let ee=!0;for(const E of Bn(X)){const _=E.kind===0?yd(j,E.fieldPath,j.startAt):Id(j,E.fieldPath,j.startAt);J.push(_.value),ee&&(ee=_.inclusive)}return new Hr(J,ee)})(h,u),P=(function(j,X){const J=[];let ee=!0;for(const E of Bn(X)){const _=E.kind===0?Id(j,E.fieldPath,j.endAt):yd(j,E.fieldPath,j.endAt);J.push(_.value),ee&&(ee=_.inclusive)}return new Hr(J,ee)})(h,u),V=this.rs(u,h,g),L=this.rs(u,h,P),k=this.ss(u,h,p),$=this._s(u.indexId,f,V,g.inclusive,L,P.inclusive,k);return A.forEach($,(K=>r.Gn(K,t.limit).next((j=>{j.forEach((X=>{const J=F.fromSegments(X.documentKey);o.has(J)||(o=o.add(J),c.push(J))}))}))))})).next((()=>c))}return A.resolve(null)}))}ts(e){let t=this.es.get(e);return t||(e.filters.length===0?t=[e]:t=JA(oe.create(e.filters,"and")).map((r=>Mc(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt))),this.es.set(e,t),t)}_s(e,t,r,s,i,o,c){const u=(t!=null?t.length:1)*Math.max(r.length,i.length),h=u/(t!=null?t.length:1),f=[];for(let p=0;p<u;++p){const g=t?this.us(t[p/h]):uo,P=this.cs(e,g,r[p%h],s),V=this.ls(e,g,i[p%h],o),L=c.map((k=>this.cs(e,g,k,!0)));f.push(...this.createRange(P,V,L))}return f}cs(e,t,r,s){const i=new Gn(e,F.empty(),t,r);return s?i:i.ki()}ls(e,t,r,s){const i=new Gn(e,F.empty(),t,r);return s?i.ki():i}ns(e,t){const r=new Yd(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next((i=>{let o=null;for(const c of i)r.zi(c)&&(!o||c.fields.length>o.fields.length)&&(o=c);return o}))}getIndexType(e,t){let r=2;const s=this.ts(t);return A.forEach(s,(i=>this.ns(e,i).next((o=>{o?r!==0&&o.fields.length<(function(u){let h=new ie(Te.comparator),f=!1;for(const p of u.filters)for(const g of p.getFlattenedFilters())g.field.isKeyField()||(g.op==="array-contains"||g.op==="array-contains-any"?f=!0:h=h.add(g.field));for(const p of u.orderBy)p.field.isKeyField()||(h=h.add(p.field));return h.size+(f?1:0)})(i)&&(r=1):r=0})))).next((()=>(function(o){return o.limit!==null})(t)&&s.length>1&&r===2?1:r))}Es(e,t){const r=new Rs;for(const s of Bn(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=r.Mi(s.kind);zn.Pi.ei(i,o)}return r.Fi()}us(e){const t=new Rs;return zn.Pi.ei(e,t.Mi(0)),t.Fi()}hs(e,t){const r=new Rs;return zn.Pi.ei(Zs(this.databaseId,t),r.Mi((function(i){const o=Bn(i);return o.length===0?0:o[o.length-1].kind})(e))),r.Fi()}ss(e,t,r){if(r===null)return[];let s=[];s.push(new Rs);let i=0;for(const o of Bn(e)){const c=r[i++];for(const u of s)if(this.Ts(t,o.fieldPath)&&Tn(c))s=this.Ps(s,o,c);else{const h=u.Mi(o.kind);zn.Pi.ei(c,h)}}return this.Is(s)}rs(e,t,r){return this.ss(e,t,r.position)}Is(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].Fi();return t}Ps(e,t,r){const s=[...e],i=[];for(const o of r.arrayValue.values||[])for(const c of s){const u=new Rs;u.seed(c.Fi()),zn.Pi.ei(o,u.Mi(t.kind)),i.push(u)}return i}Ts(e,t){return!!e.filters.find((r=>r instanceof ne&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in")))}getFieldIndexes(e,t){const r=Ps(e),s=Vr(e);return(t?r.Qn(Kc,IDBKeyRange.bound(t,t)):r.Qn()).next((i=>{const o=[];return A.forEach(i,(c=>s.get([c.indexId,this.uid]).next((u=>{o.push((function(f,p){const g=p?new si(p.sequenceNumber,new tt(pr(p.readTime),new F(Et(p.documentKey)),p.largestBatchId)):si.empty(),P=f.fields.map((([V,L])=>new wo(Te.fromServerFormat(V),L)));return new qo(f.indexId,f.collectionGroup,P,g)})(c,u))})))).next((()=>o))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((r,s)=>{const i=r.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:H(r.collectionGroup,s.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,r){const s=Ps(e),i=Vr(e);return this.Rs(e).next((o=>s.Qn(Kc,IDBKeyRange.bound(t,t)).next((c=>A.forEach(c,(u=>i.put(zd(u.indexId,this.uid,o,r))))))))}updateIndexEntries(e,t){const r=new Map;return A.forEach(t,((s,i)=>{const o=r.get(s.collectionGroup);return(o?A.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next((c=>(r.set(s.collectionGroup,c),A.forEach(c,(u=>this.As(e,s,u).next((h=>{const f=this.Vs(i,u);return h.isEqual(f)?A.resolve():this.ds(e,i,u,h,f)})))))))}))}fs(e,t,r,s){return Sr(e).put(s.qi(this.uid,this.hs(r,t.key),t.key))}ps(e,t,r,s){return Sr(e).delete(s.$i(this.uid,this.hs(r,t.key),t.key))}As(e,t,r){const s=Sr(e);let i=new ie(nn);return s.Hn({index:ag,range:IDBKeyRange.only([r.indexId,this.uid,So(this.hs(r,t))])},((o,c)=>{i=i.add(new Gn(r.indexId,t,Qd(c.arrayValue),Qd(c.directionalValue)))})).next((()=>i))}Vs(e,t){let r=new ie(nn);const s=this.Es(t,e);if(s==null)return r;const i=Lc(t);if(i!=null){const o=e.data.field(i.fieldPath);if(Tn(o))for(const c of o.arrayValue.values||[])r=r.add(new Gn(t.indexId,e.key,this.us(c),s))}else r=r.add(new Gn(t.indexId,e.key,uo,s));return r}ds(e,t,r,s,i){D(Xd,"Updating index entries for document '%s'",t.key);const o=[];return(function(u,h,f,p,g){const P=u.getIterator(),V=h.getIterator();let L=Ar(P),k=Ar(V);for(;L||k;){let $=!1,K=!1;if(L&&k){const j=f(L,k);j<0?K=!0:j>0&&($=!0)}else L!=null?K=!0:$=!0;$?(p(k),k=Ar(V)):K?(g(L),L=Ar(P)):(L=Ar(P),k=Ar(V))}})(s,i,nn,(c=>{o.push(this.fs(e,t,r,c))}),(c=>{o.push(this.ps(e,t,r,c))})),A.waitFor(o)}Rs(e){let t=1;return Vr(e).Hn({index:og,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((r,s,i)=>{i.done(),t=s.sequenceNumber+1})).next((()=>t))}createRange(e,t,r){r=r.sort(((o,c)=>nn(o,c))).filter(((o,c,u)=>!c||nn(o,u[c-1])!==0));const s=[];s.push(e);for(const o of r){const c=nn(o,e),u=nn(o,t);if(c===0)s[0]=e.ki();else if(c>0&&u<0)s.push(o),s.push(o.ki());else if(u>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.gs(s[o],s[o+1]))return[];const c=s[o].$i(this.uid,uo,F.empty()),u=s[o+1].$i(this.uid,uo,F.empty());i.push(IDBKeyRange.bound(c,u))}return i}gs(e,t){return nn(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(ef)}getMinOffset(e,t){return A.mapArray(this.ts(t),(r=>this.ns(e,r).next((s=>s||B(44426))))).next(ef)}}function Zd(n){return Ae(n,pi)}function Sr(n){return Ae(n,Ks)}function Ps(n){return Ae(n,Ju)}function Vr(n){return Ae(n,Gs)}function ef(n){O(n.length!==0,28825);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const s=n[r].indexState.offset;Au(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new tt(e.readTime,e.documentKey,t)}/**
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
 */class zt{constructor(e){this.ys=e}next(){return this.ys+=2,this.ys}static ws(){return new zt(0)}static bs(){return new zt(-1)}}/**
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
 */class eR{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.Ss(e).next((t=>{const r=new zt(t.highestTargetId);return t.highestTargetId=r.next(),this.vs(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.Ss(e).next((t=>q.fromTimestamp(new se(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.Ss(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,r){return this.Ss(e).next((s=>(s.highestListenSequenceNumber=t,r&&(s.lastRemoteSnapshotVersion=r.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.vs(e,s))))}addTargetData(e,t){return this.Ds(e,t).next((()=>this.Ss(e).next((r=>(r.targetCount+=1,this.xs(t,r),this.vs(e,r))))))}updateTargetData(e,t){return this.Ds(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>Cr(e).delete(t.targetId))).next((()=>this.Ss(e))).next((r=>(O(r.targetCount>0,8065),r.targetCount-=1,this.vs(e,r))))}removeTargets(e,t,r){let s=0;const i=[];return Cr(e).Hn(((o,c)=>{const u=ks(this.serializer,c);u.sequenceNumber<=t&&r.get(u.targetId)===null&&(s++,i.push(this.removeTargetData(e,u)))})).next((()=>A.waitFor(i))).next((()=>s))}forEachTarget(e,t){return Cr(e).Hn(((r,s)=>{const i=ks(this.serializer,s);t(i)}))}Ss(e){return tf(e).get(Yo).next((t=>(O(t!==null,2888),t)))}vs(e,t){return tf(e).put(Yo,t)}Ds(e,t){return Cr(e).put(mg(this.serializer,t))}xs(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.Ss(e).next((t=>t.targetCount))}getTargetData(e,t){const r=Va(t),s=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let i=null;return Cr(e).Hn({range:s,index:ig},((o,c,u)=>{const h=ks(this.serializer,c);Hu(t,h.target)&&(i=h,u.done())})).next((()=>i))}addMatchingKeys(e,t,r){const s=[],i=dn(e);return t.forEach((o=>{const c=Me(o.path);s.push(i.put({targetId:r,path:c})),s.push(this.referenceDelegate.addReference(e,r,o))})),A.waitFor(s)}removeMatchingKeys(e,t,r){const s=dn(e);return A.forEach(t,(i=>{const o=Me(i.path);return A.waitFor([s.delete([r,o]),this.referenceDelegate.removeReference(e,r,i)])}))}removeMatchingKeysForTargetId(e,t){const r=dn(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(s)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),s=dn(e);let i=Q();return s.Hn({range:r,jn:!0},((o,c,u)=>{const h=Et(o[1]),f=new F(h);i=i.add(f)})).next((()=>i))}containsKey(e,t){const r=Me(t.path),s=IDBKeyRange.bound([r],[xp(r)],!1,!0);let i=0;return dn(e).Hn({index:Yu,jn:!0,range:s},(([o,c],u,h)=>{o!==0&&(i++,h.done())})).next((()=>i>0))}ye(e,t){return Cr(e).get(t).next((r=>r?ks(this.serializer,r):null))}}function Cr(n){return Ae(n,Yr)}function tf(n){return Ae(n,er)}function dn(n){return Ae(n,Jr)}/**
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
 */class tR{constructor(e,t){this.db=e,this.garbageCollector=km(this,t)}ir(e){const t=this.Cs(e);return this.db.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Cs(e){let t=0;return this.sr(e,(r=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}sr(e,t){return this.Fs(e,((r,s)=>t(s)))}addReference(e,t,r){return lo(e,r)}removeReference(e,t,r){return lo(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return lo(e,t)}Os(e,t){return(function(s,i){let o=!1;return yg(s).Jn((c=>_g(s,c,i).next((u=>(u&&(o=!0),A.resolve(!u)))))).next((()=>o))})(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Fs(e,((o,c)=>{if(c<=t){const u=this.Os(e,o).next((h=>{if(!h)return i++,r.getEntry(e,o).next((()=>(r.removeEntry(o,q.min()),dn(e).delete((function(p){return[0,Me(p.path)]})(o)))))}));s.push(u)}})).next((()=>A.waitFor(s))).next((()=>r.apply(e))).next((()=>i))}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return lo(e,t)}Fs(e,t){const r=dn(e);let s,i=it.wn;return r.Hn({index:Yu},(([o,c],{path:u,sequenceNumber:h})=>{o===0?(i!==it.wn&&t(new F(Et(s)),i),i=h,s=u):i=it.wn})).next((()=>{i!==it.wn&&t(new F(Et(s)),i)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function lo(n,e){return dn(n).put((function(r,s){return{targetId:0,path:Me(r.path),sequenceNumber:s}})(e,n.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function Tg(n,e){var r;let t=e;for(const s of n.stages)t=nR({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},s,t);return t}function Oa(n,e){return Tg(n,[e]).length>0}function wg(n,e){return ge(n)?Oa(n,e):ya(n,e)}function nR(n,e,t){if(e instanceof xi)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()&&`/${c.key.getCollectionPath().canonicalString()}`===i.hr))})(0,e,t);if(e instanceof Ni)return(function(s,i,o){return o.filter((c=>{const u=zs(z(i.condition).evaluate(s,c));return u!==void 0&&ut(u,Qe)}))})(n,e,t);if(e instanceof Di)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()&&c.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Ra)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()))})(0,0,t);if(e instanceof Pa)return(function(s,i,o){return o.filter((c=>c.isFoundDocument()&&i.Pr.has(c.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof An)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof It)return(function(s,i,o){const c=i.orderings.map((u=>({Ms:z(u.expr),direction:u.direction})));return[...o].sort(((u,h)=>{for(const{Ms:f,direction:p}of c){const g=zs(f.evaluate(s,u)),P=zs(f.evaluate(s,h)),V=Ue(g??At,P??At);if(V!==0)return p==="ascending"?V:-V}return 0}))})(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function Zc(n){const e=(function(r){for(let s=r.stages.length-1;s>=0;s--){const i=r.stages[s];if(i instanceof It)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(n);return(t,r)=>{for(const s of e){const i=zs(z(s.expr).evaluate({serializer:n.serializer},t)),o=zs(z(s.expr).evaluate({serializer:n.serializer},r)),c=Ue(i||At,o||At);if(c!==0)return s.direction==="ascending"?c:-c}return 0}}function _c(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof An)return{limit:t.limit}}}/**
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
 */class vg{constructor(){this.changes=new Kt((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,fe.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?A.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class rR{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return rn(e).put(r)}removeEntry(e,t,r){return rn(e).delete((function(i,o){const c=i.path.toArray();return[c.slice(0,c.length-2),c[c.length-2],Xo(o),c[c.length-1]]})(t,r))}updateMetadata(e,t){return this.getMetadata(e).next((r=>(r.byteSize+=t,this.Ns(e,r))))}getEntry(e,t){let r=fe.newInvalidDocument(t);return rn(e).Hn({index:bo,range:IDBKeyRange.only(bs(t))},((s,i)=>{r=this.Ls(t,i)})).next((()=>r))}Bs(e,t){let r={size:0,document:fe.newInvalidDocument(t)};return rn(e).Hn({index:bo,range:IDBKeyRange.only(bs(t))},((s,i)=>{r={document:this.Ls(t,i),size:Jo(i)}})).next((()=>r))}getEntries(e,t){let r=Ee();return this.Us(e,t,((s,i)=>{const o=this.Ls(s,i);r=r.insert(s,o)})).next((()=>r))}getAllEntries(e){let t=Ee();return rn(e).Hn(((r,s)=>{const i=this.Ls(F.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);t=t.insert(i.key,i)})).next((()=>t))}ks(e,t){let r=Ee(),s=new le(F.comparator);return this.Us(e,t,((i,o)=>{const c=this.Ls(i,o);r=r.insert(i,c),s=s.insert(i,Jo(o))})).next((()=>({documents:r,qs:s})))}Us(e,t,r){if(t.isEmpty())return A.resolve();let s=new ie(sf);t.forEach((u=>s=s.add(u)));const i=IDBKeyRange.bound(bs(s.first()),bs(s.last())),o=s.getIterator();let c=o.getNext();return rn(e).Hn({index:bo,range:i},((u,h,f)=>{const p=F.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;c&&sf(c,p)<0;)r(c,null),c=o.getNext();c&&c.isEqual(p)&&(r(c,h),c=o.hasNext()?o.getNext():null),c?f.Kn(bs(c)):f.done()})).next((()=>{for(;c;)r(c,null),c=o.hasNext()?o.getNext():null}))}getDocumentsMatchingQuery(e,t,r,s,i){const o=ge(t)?Z.fromString(ki(t)):t.path,c=[o.popLast().toArray(),o.lastSegment(),Xo(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return rn(e).Qn(IDBKeyRange.bound(c,u,!0)).next((h=>{i==null||i.incrementDocumentReadCount(h.length);let f=Ee();for(const p of h){const g=this.Ls(F.fromSegments(p.prefixPath.concat(p.collectionGroup,p.documentId)),p);g.isFoundDocument()&&(wg(t,g)||s.has(g.key))&&(f=f.insert(g.key,g))}return f}))}getAllFromCollectionGroup(e,t,r,s){let i=Ee();const o=rf(t,r),c=rf(t,tt.max());return rn(e).Hn({index:sg,range:IDBKeyRange.bound(o,c,!0)},((u,h,f)=>{const p=this.Ls(F.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);i=i.insert(p.key,p),i.size===s&&f.done()})).next((()=>i))}newChangeBuffer(e){return new sR(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return nf(e).get(Gc).next((t=>(O(!!t,20021),t)))}Ns(e,t){return nf(e).put(Gc,t)}Ls(e,t){if(t){const r=jA(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(q.min())))return r}return fe.newInvalidDocument(e)}}function Ag(n){return new rR(n)}class sR extends vg{constructor(e,t){super(),this.$s=e,this.trackRemovals=t,this.Ks=new Kt((r=>r.toString()),((r,s)=>r.isEqual(s)))}applyChanges(e){const t=[];let r=0,s=new ie(((i,o)=>H(i.canonicalString(),o.canonicalString())));return this.changes.forEach(((i,o)=>{const c=this.Ks.get(i);if(t.push(this.$s.removeEntry(e,i,c.readTime)),o.isValidDocument()){const u=$d(this.$s.serializer,o);s=s.add(i.path.popLast());const h=Jo(u);r+=h-c.size,t.push(this.$s.addEntry(e,i,u))}else if(r-=c.size,this.trackRemovals){const u=$d(this.$s.serializer,o.convertToNoDocument(q.min()));t.push(this.$s.addEntry(e,i,u))}})),s.forEach((i=>{t.push(this.$s.indexManager.addToCollectionParentIndex(e,i))})),t.push(this.$s.updateMetadata(e,r)),A.waitFor(t)}getFromCache(e,t){return this.$s.Bs(e,t).next((r=>(this.Ks.set(t,{size:r.size,readTime:r.document.readTime}),r.document)))}getAllFromCache(e,t){return this.$s.ks(e,t).next((({documents:r,qs:s})=>(s.forEach(((i,o)=>{this.Ks.set(i,{size:o,readTime:r.get(i).readTime})})),r)))}}function nf(n){return Ae(n,fi)}function rn(n){return Ae(n,Qo)}function bs(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function rf(n,e){const t=e.documentKey.path.toArray();return[n,Xo(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function sf(n,e){const t=n.path.toArray(),r=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<r.length-2;++i)if(s=H(t[i],r[i]),s)return s;return s=H(t.length,r.length),s||(s=H(t[t.length-2],r[r.length-2]),s||H(t[t.length-1],r[r.length-1]))}/**
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
 */class iR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class Rg{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(r=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(r!==null&&Us(r.mutation,s,Ke.empty(),se.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.getLocalViewOfDocuments(e,r,Q()).next((()=>r))))}getLocalViewOfDocuments(e,t,r=Q()){const s=rt();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,r).next((i=>{let o=Nr();return i.forEach(((c,u)=>{o=o.insert(c,u.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const r=rt();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,Q())))}populateOverlays(e,t,r){const s=[];return r.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,c)=>{t.set(o,c)}))}))}computeViews(e,t,r,s){let i=Ee();const o=qs(),c=(function(){return qs()})();return t.forEach(((u,h)=>{const f=r.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof Gt)?i=i.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),Us(f.mutation,h,f.mutation.getFieldMask(),se.now())):o.set(h.key,Ke.empty())})),this.recalculateAndSaveOverlays(e,i).next((u=>(u.forEach(((h,f)=>o.set(h,f))),t.forEach(((h,f)=>c.set(h,new iR(f,o.get(h)??null)))),c)))}recalculateAndSaveOverlays(e,t){const r=qs();let s=new le(((o,c)=>o-c)),i=Q();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const c of o)c.keys().forEach((u=>{const h=t.get(u);if(h===null)return;let f=r.get(u)||Ke.empty();f=c.applyToLocalView(h,f),r.set(u,f);const p=(s.get(c.batchId)||Q()).add(u);s=s.insert(c.batchId,p)}))})).next((()=>{const o=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),h=u.key,f=u.value,p=cm();f.forEach((g=>{if(!i.has(g)){const P=Hp(t.get(g),r.get(g));P!==null&&p.set(g,P),i=i.add(g)}})),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return A.waitFor(o)})).next((()=>r))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((r=>this.recalculateAndSaveOverlays(e,r)))}getDocumentsMatchingQuery(e,t,r,s){return ge(t)?this.getDocumentsMatchingPipeline(e,t,r,s):UT(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):sm(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):A.resolve(rt());let c=ri,u=i;return o.next((h=>A.forEach(h,((f,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),i.get(f)?A.resolve():this.remoteDocumentCache.getEntry(e,f).next((g=>{u=u.insert(f,g)}))))).next((()=>this.populateOverlays(e,h,i))).next((()=>this.computeViews(e,u,h,Q()))).next((f=>({batchId:c,changes:am(f)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new F(t)).next((r=>{let s=Nr();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=Nr();return this.indexManager.getCollectionParents(e,i).next((c=>A.forEach(c,(u=>{const h=(function(p,g){return new rs(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)})(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next((f=>{f.forEach(((p,g)=>{o=o.insert(p,g)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(c=>ya(t,c)))))}getDocumentsMatchingPipeline(e,t,r,s){if(_n(t)==="collection_group"){const i=Bu(t);let o=Nr();return this.indexManager.getCollectionParents(e,i).next((c=>A.forEach(c,(u=>{const h=(function(p,g){const P=p.stages.map((V=>V instanceof Di?new xi(g.canonicalString(),{}):V));return new Le(p.serializer,P)})(t,u.child(i));return this.getDocumentsMatchingPipeline(e,h,r,s).next((f=>{f.forEach(((p,g)=>{o=o.insert(p,g)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next((o=>{switch(i=o,_n(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s);case"documents":let c=Q();for(const u of zc(t))c=c.add(F.fromPath(u));return this.remoteDocumentCache.getEntries(e,c);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new N("invalid-argument",`Invalid pipeline source to execute offline: ${Mt(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(c=>Oa(t,c)))))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach(((i,o)=>{const c=o.getKey();t.get(c)===null&&(t=t.insert(c,fe.newInvalidDocument(c)))}));let s=Nr();return t.forEach(((i,o)=>{const c=e.get(i);c!==void 0&&Us(c.mutation,o,Ke.empty(),se.now()),r(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,r){switch(_n(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,Z.fromString(ki(t)),r);case"collection_group":throw new N("invalid-argument",`Unexpected collection group pipeline: ${Mt(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,zc(t).map((s=>F.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new N("invalid-argument",`Failed to get overlays for pipeline: ${Mt(t)}`)}}}/**
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
 */class oR{constructor(e){this.serializer=e,this.Qs=new Map,this.Ws=new Map}getBundleMetadata(e,t){return A.resolve(this.Qs.get(t))}saveBundleMetadata(e,t){return this.Qs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:je(s.createTime)}})(t)),A.resolve()}getNamedQuery(e,t){return A.resolve(this.Ws.get(t))}saveNamedQuery(e,t){return this.Ws.set(t.name,(function(s){return{name:s.name,query:gg(s.bundledQuery),readTime:je(s.readTime)}})(t)),A.resolve()}}/**
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
 */class aR{constructor(){this.overlays=new le(F.comparator),this.Gs=new Map}getOverlay(e,t){return A.resolve(this.overlays.get(t))}getOverlays(e,t){const r=rt();return A.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&r.set(s,i)})))).next((()=>r))}getAllOverlays(e,t){const r=rt();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&r.set(s,i)})),A.resolve(r)}saveOverlays(e,t,r){return r.forEach(((s,i)=>{this.Zr(e,t,i)})),A.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Gs.get(r);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Gs.delete(r)),A.resolve()}getOverlaysForCollection(e,t,r){const s=rt(),i=t.length+1,o=new F(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const u=c.getNext().value,h=u.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return A.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new le(((h,f)=>h-f));const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let f=i.get(h.largestBatchId);f===null&&(f=rt(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const c=rt(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach(((h,f)=>c.set(h,f))),!(c.size()>=s)););return A.resolve(c)}Zr(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Gs.get(s.largestBatchId).delete(r.key);this.Gs.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new el(t,r));let i=this.Gs.get(t);i===void 0&&(i=Q(),this.Gs.set(t,i)),this.Gs.set(t,i.add(r.key))}}/**
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
 */class cR{constructor(){this.sessionToken=he.EMPTY_BYTE_STRING}getSessionToken(e){return A.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,A.resolve()}}/**
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
 */class rl{constructor(){this.zs=new ie(Pe.js),this.Hs=new ie(Pe.Js)}isEmpty(){return this.zs.isEmpty()}addReference(e,t){const r=new Pe(e,t);this.zs=this.zs.add(r),this.Hs=this.Hs.add(r)}Ys(e,t){e.forEach((r=>this.addReference(r,t)))}removeReference(e,t){this.Zs(new Pe(e,t))}Xs(e,t){e.forEach((r=>this.removeReference(r,t)))}e_(e){const t=new F(new Z([])),r=new Pe(t,e),s=new Pe(t,e+1),i=[];return this.Hs.forEachInRange([r,s],(o=>{this.Zs(o),i.push(o.key)})),i}t_(){this.zs.forEach((e=>this.Zs(e)))}Zs(e){this.zs=this.zs.delete(e),this.Hs=this.Hs.delete(e)}n_(e){const t=new F(new Z([])),r=new Pe(t,e),s=new Pe(t,e+1);let i=Q();return this.Hs.forEachInRange([r,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new Pe(e,0),r=this.zs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Pe{constructor(e,t){this.key=e,this.r_=t}static js(e,t){return F.comparator(e.key,t.key)||H(e.r_,t.r_)}static Js(e,t){return H(e.r_,t.r_)||F.comparator(e.key,t.key)}}/**
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
 */class uR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Gr=1,this.i_=new ie(Pe.js)}checkEmpty(e){return A.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Gr;this.Gr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Wu(i,t,r,s);this.mutationQueue.push(o);for(const c of s)this.i_=this.i_.add(new Pe(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return A.resolve(o)}lookupMutationBatch(e,t){return A.resolve(this.s_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.__(r),i=s<0?0:s;return A.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return A.resolve(this.mutationQueue.length===0?Yn:this.Gr-1)}getAllMutationBatches(e){return A.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Pe(t,0),s=new Pe(t,Number.POSITIVE_INFINITY),i=[];return this.i_.forEachInRange([r,s],(o=>{const c=this.s_(o.r_);i.push(c)})),A.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ie(H);return t.forEach((s=>{const i=new Pe(s,0),o=new Pe(s,Number.POSITIVE_INFINITY);this.i_.forEachInRange([i,o],(c=>{r=r.add(c.r_)}))})),A.resolve(this.o_(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;F.isDocumentKey(i)||(i=i.child(""));const o=new Pe(new F(i),0);let c=new ie(H);return this.i_.forEachWhile((u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(u.r_)),!0)}),o),A.resolve(this.o_(c))}o_(e){const t=[];return e.forEach((r=>{const s=this.s_(r);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){O(this.a_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.i_;return A.forEach(t.mutations,(s=>{const i=new Pe(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.i_=r}))}Hr(e){}containsKey(e,t){const r=new Pe(t,0),s=this.i_.firstAfterOrEqual(r);return A.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,A.resolve()}a_(e,t){return this.__(e)}__(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}s_(e){const t=this.__(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class lR{constructor(e){this.u_=e,this.docs=(function(){return new le(F.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.u_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return A.resolve(r?r.document.mutableCopy():fe.newInvalidDocument(t))}getEntries(e,t){let r=Ee();return t.forEach((s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():fe.newInvalidDocument(s))})),A.resolve(r)}getAllEntries(e){let t=Ee();return this.docs.forEach(((r,s)=>{t=t.insert(r,s.document)})),A.resolve(t)}getDocumentsMatchingQuery(e,t,r,s){let i,o;ge(t)?(i=Z.fromString(ki(t)),o=f=>Oa(t,f)):(i=t.path,o=f=>ya(t,f));let c=Ee();const u=new F(i.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(u);for(;h.hasNext();){const{key:f,value:{document:p}}=h.getNext();if(!i.isPrefixOf(f.path))break;f.path.length>i.length+1||Au(rm(p),r)<=0||(s.has(p.key)||o(p))&&(c=c.insert(p.key,p.mutableCopy()))}return A.resolve(c)}getAllFromCollectionGroup(e,t,r,s){B(9500)}c_(e,t){return A.forEach(this.docs,(r=>t(r)))}newChangeBuffer(e){return new hR(this)}getSize(e){return A.resolve(this.size)}}class hR extends vg{constructor(e){super(),this.$s=e}applyChanges(e){const t=[];return this.changes.forEach(((r,s)=>{s.isValidDocument()?t.push(this.$s.addEntry(e,s)):this.$s.removeEntry(r)})),A.waitFor(t)}getFromCache(e,t){return this.$s.getEntry(e,t)}getAllFromCache(e,t){return this.$s.getEntries(e,t)}}/**
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
 */class dR{constructor(e){this.persistence=e,this.l_=new Kt((t=>Va(t)),Hu),this.lastRemoteSnapshotVersion=q.min(),this.highestTargetId=0,this.E_=0,this.h_=new rl,this.targetCount=0,this.T_=zt.ws()}forEachTarget(e,t){return this.l_.forEach(((r,s)=>t(s))),A.resolve()}getLastRemoteSnapshotVersion(e){return A.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return A.resolve(this.E_)}allocateTargetId(e){return this.highestTargetId=this.T_.next(),A.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.E_&&(this.E_=t),A.resolve()}Ds(e){this.l_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.T_=new zt(t),this.highestTargetId=t),e.sequenceNumber>this.E_&&(this.E_=e.sequenceNumber)}addTargetData(e,t){return this.Ds(t),this.targetCount+=1,A.resolve()}updateTargetData(e,t){return this.Ds(t),A.resolve()}removeTargetData(e,t){return this.l_.delete(t.target),this.h_.e_(t.targetId),this.targetCount-=1,A.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.l_.forEach(((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.l_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)})),A.waitFor(i).next((()=>s))}getTargetCount(e){return A.resolve(this.targetCount)}getTargetData(e,t){const r=this.l_.get(t)||null;return A.resolve(r)}addMatchingKeys(e,t,r){return this.h_.Ys(t,r),A.resolve()}removeMatchingKeys(e,t,r){this.h_.Xs(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),A.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.h_.e_(t),A.resolve()}getMatchingKeysForTargetId(e,t){const r=this.h_.n_(t);return A.resolve(r)}containsKey(e,t){return A.resolve(this.h_.containsKey(t))}}/**
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
 */class sl{constructor(e,t){this.P_={},this.overlays={},this.I_=new it(0),this.R_=!1,this.R_=!0,this.A_=new cR,this.referenceDelegate=e(this),this.V_=new dR(this),this.indexManager=new XA,this.remoteDocumentCache=(function(s){return new lR(s)})((r=>this.referenceDelegate.d_(r))),this.serializer=new pg(t),this.f_=new oR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new aR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.P_[e.toKey()];return r||(r=new uR(t,this.referenceDelegate),this.P_[e.toKey()]=r),r}getGlobalsCache(){return this.A_}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.f_}runTransaction(e,t,r){D("MemoryPersistence","Starting transaction:",e);const s=new fR(this.I_.next());return this.referenceDelegate.m_(),r(s).next((i=>this.referenceDelegate.p_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}g_(e,t){return A.or(Object.values(this.P_).map((r=>()=>r.containsKey(e,t))))}}class fR extends xm{constructor(e){super(),this.currentSequenceNumber=e}}class La{constructor(e){this.persistence=e,this.y_=new rl,this.w_=null}static b_(e){return new La(e)}get S_(){if(this.w_)return this.w_;throw B(60996)}addReference(e,t,r){return this.y_.addReference(r,t),this.S_.delete(r.toString()),A.resolve()}removeReference(e,t,r){return this.y_.removeReference(r,t),this.S_.add(r.toString()),A.resolve()}markPotentiallyOrphaned(e,t){return this.S_.add(t.toString()),A.resolve()}removeTarget(e,t){this.y_.e_(t.targetId).forEach((s=>this.S_.add(s.toString())));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.S_.add(i.toString())))})).next((()=>r.removeTargetData(e,t)))}m_(){this.w_=new Set}p_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return A.forEach(this.S_,(r=>{const s=F.fromPath(r);return this.v_(e,s).next((i=>{i||t.removeEntry(s,q.min())}))})).next((()=>(this.w_=null,t.apply(e))))}updateLimboDocument(e,t){return this.v_(e,t).next((r=>{r?this.S_.delete(t.toString()):this.S_.add(t.toString())}))}d_(e){return 0}v_(e,t){return A.or([()=>A.resolve(this.y_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.g_(e,t)])}}class ea{constructor(e,t){this.persistence=e,this.D_=new Kt((r=>Me(r.path)),((r,s)=>r.isEqual(s))),this.garbageCollector=km(this,t)}static b_(e,t){return new ea(e,t)}m_(){}p_(e){return A.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}ir(e){const t=this.Cs(e);return this.persistence.getTargetCache().getTargetCount(e).next((r=>t.next((s=>r+s))))}Cs(e){let t=0;return this.sr(e,(r=>{t++})).next((()=>t))}sr(e,t){return A.forEach(this.D_,((r,s)=>this.Os(e,r,s).next((i=>i?A.resolve():t(s)))))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.c_(e,(o=>this.Os(e,o,t).next((c=>{c||(r++,i.removeEntry(o,q.min()))})))).next((()=>i.apply(e))).next((()=>r))}markPotentiallyOrphaned(e,t){return this.D_.set(t,e.currentSequenceNumber),A.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),A.resolve()}removeReference(e,t,r){return this.D_.set(r,e.currentSequenceNumber),A.resolve()}updateLimboDocument(e,t){return this.D_.set(t,e.currentSequenceNumber),A.resolve()}d_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Eo(e.data.value)),t}Os(e,t,r){return A.or([()=>this.persistence.g_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.D_.get(t);return A.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class pR{constructor(e){this.serializer=e}Nn(e,t,r,s){const i=new Ta("createOrUpgrade",t);r<1&&s>=1&&((function(u){u.createObjectStore(Li)})(e),(function(u){u.createObjectStore(di,{keyPath:yA}),u.createObjectStore(lt,{keyPath:Bd,autoIncrement:!0}).createIndex(Wn,qd,{unique:!0}),u.createObjectStore(Qr)})(e),of(e),(function(u){u.createObjectStore(qn)})(e));let o=A.resolve();return r<3&&s>=3&&(r!==0&&((function(u){u.deleteObjectStore(Jr),u.deleteObjectStore(Yr),u.deleteObjectStore(er)})(e),of(e)),o=o.next((()=>(function(u){const h=u.store(er),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:q.min().toTimestamp(),targetCount:0};return h.put(Yo,f)})(i)))),r<4&&s>=4&&(r!==0&&(o=o.next((()=>(function(u,h){return h.store(lt).Qn().next((p=>{u.deleteObjectStore(lt),u.createObjectStore(lt,{keyPath:Bd,autoIncrement:!0}).createIndex(Wn,qd,{unique:!0});const g=h.store(lt),P=p.map((V=>g.put(V)));return A.waitFor(P)}))})(e,i)))),o=o.next((()=>{(function(u){u.createObjectStore(Xr,{keyPath:bA})})(e)}))),r<5&&s>=5&&(o=o.next((()=>this.x_(i)))),r<6&&s>=6&&(o=o.next((()=>((function(u){u.createObjectStore(fi)})(e),this.C_(i))))),r<7&&s>=7&&(o=o.next((()=>this.F_(i)))),r<8&&s>=8&&(o=o.next((()=>this.O_(e,i)))),r<9&&s>=9&&(o=o.next((()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)}))),r<10&&s>=10&&(o=o.next((()=>this.M_(i)))),r<11&&s>=11&&(o=o.next((()=>{(function(u){u.createObjectStore(Ca,{keyPath:SA})})(e),(function(u){u.createObjectStore(xa,{keyPath:VA})})(e)}))),r<12&&s>=12&&(o=o.next((()=>{(function(u){const h=u.createObjectStore(Da,{keyPath:LA});h.createIndex(Hc,MA,{unique:!1}),h.createIndex(cg,UA,{unique:!1})})(e)}))),r<13&&s>=13&&(o=o.next((()=>(function(u){const h=u.createObjectStore(Qo,{keyPath:EA});h.createIndex(bo,TA),h.createIndex(sg,wA)})(e))).next((()=>this.N_(e,i))).next((()=>e.deleteObjectStore(qn)))),r<14&&s>=14&&(o=o.next((()=>this.L_(e,i)))),r<15&&s>=15&&(o=o.next((()=>(function(u){u.createObjectStore(Ju,{keyPath:CA,autoIncrement:!0}).createIndex(Kc,xA,{unique:!1}),u.createObjectStore(Gs,{keyPath:DA}).createIndex(og,NA,{unique:!1}),u.createObjectStore(Ks,{keyPath:kA}).createIndex(ag,OA,{unique:!1})})(e)))),r<16&&s>=16&&(o=o.next((()=>{t.objectStore(Gs).clear()})).next((()=>{t.objectStore(Ks).clear()}))),r<17&&s>=17&&(o=o.next((()=>{(function(u){u.createObjectStore(Xu,{keyPath:FA})})(e)}))),r<18&&s>=18&&Uf()&&(o=o.next((()=>{t.objectStore(Gs).clear()})).next((()=>{t.objectStore(Ks).clear()}))),o}C_(e){let t=0;return e.store(qn).Hn(((r,s)=>{t+=Jo(s)})).next((()=>{const r={byteSize:t};return e.store(fi).put(Gc,r)}))}x_(e){const t=e.store(di),r=e.store(lt);return t.Qn().next((s=>A.forEach(s,(i=>{const o=IDBKeyRange.bound([i.userId,Yn],[i.userId,i.lastAcknowledgedBatchId]);return r.Qn(Wn,o).next((c=>A.forEach(c,(u=>{O(u.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const h=jn(this.serializer,u);return fg(e,i.userId,h).next((()=>{}))}))))}))))}F_(e){const t=e.store(Jr),r=e.store(qn);return e.store(er).get(Yo).next((s=>{const i=[];return r.Hn(((o,c)=>{const u=new Z(o),h=(function(p){return[0,Me(p)]})(u);i.push(t.get(h).next((f=>f?A.resolve():(p=>t.put({targetId:0,path:Me(p),sequenceNumber:s.highestListenSequenceNumber}))(u))))})).next((()=>A.waitFor(i)))}))}O_(e,t){e.createObjectStore(pi,{keyPath:PA});const r=t.store(pi),s=new nl,i=o=>{if(s.add(o)){const c=o.lastSegment(),u=o.popLast();return r.put({collectionId:c,parent:Me(u)})}};return t.store(qn).Hn({jn:!0},((o,c)=>{const u=new Z(o);return i(u.popLast())})).next((()=>t.store(Qr).Hn({jn:!0},(([o,c,u],h)=>{const f=Et(c);return i(f.popLast())}))))}M_(e){const t=e.store(Yr);return t.Hn(((r,s)=>{const i=ks(this.serializer,s),o=mg(this.serializer,i);return t.put(o)}))}N_(e,t){const r=t.store(qn),s=[];return r.Hn(((i,o)=>{const c=t.store(Qo),u=(function(p){return p.document?new F(Z.fromString(p.document.name).popFirst(5)):p.noDocument?F.fromSegments(p.noDocument.path):p.unknownDocument?F.fromSegments(p.unknownDocument.path):B(36783)})(o).path.toArray(),h={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(c.put(h))})).next((()=>A.waitFor(s)))}L_(e,t){const r=t.store(lt),s=Ag(this.serializer),i=new sl(La.b_,this.serializer.$r);return r.Qn().next((o=>{const c=new Map;return o.forEach((u=>{let h=c.get(u.userId)??Q();jn(this.serializer,u).keys().forEach((f=>h=h.add(f))),c.set(u.userId,h)})),A.forEach(c,((u,h)=>{const f=new Ce(h),p=ka.Qr(this.serializer,f),g=i.getIndexManager(f),P=Na.Qr(f,this.serializer,g,i.referenceDelegate);return new Rg(s,P,p,g).recalculateAndSaveOverlaysForDocumentKeys(new Wc(t,it.wn),u).next()}))}))}}function of(n){n.createObjectStore(Jr,{keyPath:AA}).createIndex(Yu,RA,{unique:!0}),n.createObjectStore(Yr,{keyPath:"targetId"}).createIndex(ig,vA,{unique:!0}),n.createObjectStore(er)}const sn="IndexedDbPersistence",yc=18e5,Ic=5e3,Ec="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",mR="main";class il{constructor(e,t,r,s,i,o,c,u,h,f,p=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.Ct=i,this.window=o,this.document=c,this.B_=h,this.U_=f,this.k_=p,this.I_=null,this.R_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.q_=null,this.inForeground=!1,this.K_=null,this.Q_=null,this.W_=Number.NEGATIVE_INFINITY,this.G_=g=>Promise.resolve(),!il.Ye())throw new N(C.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new tR(this,s),this.z_=t+mR,this.serializer=new pg(u),this.j_=new mn(this.z_,this.k_,new pR(this.serializer)),this.A_=new KA,this.V_=new eR(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Ag(this.serializer),this.f_=new GA,this.window&&this.window.localStorage?this.H_=this.window.localStorage:(this.H_=null,f===!1&&$e(sn,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.J_().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new N(C.FAILED_PRECONDITION,Ec);return this.Y_(),this.Z_(),this.X_(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.V_.getHighestSequenceNumber(e)))})).then((e=>{this.I_=new it(e,this.B_)})).then((()=>{this.R_=!0})).catch((e=>(this.j_&&this.j_.close(),Promise.reject(e))))}eo(e){return this.G_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.j_.Bn((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Ct.enqueueAndForget((async()=>{this.started&&await this.J_()})))}J_(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>ho(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.no(e).next((t=>{t||(this.isPrimary=!1,this.Ct.enqueueRetryable((()=>this.G_(!1))))}))})).next((()=>this.ro(e))).next((t=>this.isPrimary&&!t?this.io(e).next((()=>!1)):!!t&&this.so(e).next((()=>!0)))))).catch((e=>{if(Dn(e))return D(sn,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return D(sn,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.Ct.enqueueRetryable((()=>this.G_(e))),this.isPrimary=e}))}no(e){return Ss(e).get(Rr).next((t=>A.resolve(this._o(t))))}oo(e){return ho(e).delete(this.clientId)}async ao(){if(this.isPrimary&&!this.uo(this.W_,yc)){this.W_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const r=Ae(t,Xr);return r.Qn().next((s=>{const i=this.co(s,yc),o=s.filter((c=>i.indexOf(c)===-1));return A.forEach(o,(c=>r.delete(c.clientId))).next((()=>o))}))})).catch((()=>[]));if(this.H_)for(const t of e)this.H_.removeItem(this.lo(t.clientId))}}X_(){this.Q_=this.Ct.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.J_().then((()=>this.ao())).then((()=>this.X_()))))}_o(e){return!!e&&e.ownerId===this.clientId}ro(e){return this.U_?A.resolve(!0):Ss(e).get(Rr).next((t=>{if(t!==null&&this.uo(t.leaseTimestampMs,Ic)&&!this.Eo(t.ownerId)){if(this._o(t)&&this.networkEnabled)return!0;if(!this._o(t)){if(!t.allowTabSynchronization)throw new N(C.FAILED_PRECONDITION,Ec);return!1}}return!(!this.networkEnabled||!this.inForeground)||ho(e).Qn().next((r=>this.co(r,Ic).find((s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,c=this.networkEnabled===s.networkEnabled;if(i||o&&c)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&D(sn,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.R_=!1,this.ho(),this.Q_&&(this.Q_.cancel(),this.Q_=null),this.To(),this.Po(),await this.j_.runTransaction("shutdown","readwrite",[Li,Xr],(e=>{const t=new Wc(e,it.wn);return this.io(t).next((()=>this.oo(t)))})),this.j_.close(),this.Io()}co(e,t){return e.filter((r=>this.uo(r.updateTimeMs,t)&&!this.Eo(r.clientId)))}Ro(){return this.runTransaction("getActiveClients","readonly",(e=>ho(e).Qn().next((t=>this.co(t,yc).map((r=>r.clientId))))))}get started(){return this.R_}getGlobalsCache(){return this.A_}getMutationQueue(e,t){return Na.Qr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.V_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new ZA(e,this.serializer.$r.databaseId)}getDocumentOverlayCache(e){return ka.Qr(this.serializer,e)}getBundleCache(){return this.f_}runTransaction(e,t,r){D(sn,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=(function(u){return u===18?$A:u===17?dg:u===16?qA:u===15?Zu:u===14?hg:u===13?lg:u===12?BA:u===11?ug:void B(60245)})(this.k_);let o;return this.j_.runTransaction(e,s,i,(c=>(o=new Wc(c,this.I_?this.I_.next():it.wn),t==="readwrite-primary"?this.no(o).next((u=>!!u||this.ro(o))).next((u=>{if(!u)throw $e(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Ct.enqueueRetryable((()=>this.G_(!1))),new N(C.FAILED_PRECONDITION,Cm);return r(o)})).next((u=>this.so(o).next((()=>u)))):this.Ao(o).next((()=>r(o)))))).then((c=>(o.raiseOnCommittedEvent(),c)))}Ao(e){return Ss(e).get(Rr).next((t=>{if(t!==null&&this.uo(t.leaseTimestampMs,Ic)&&!this.Eo(t.ownerId)&&!this._o(t)&&!(this.U_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new N(C.FAILED_PRECONDITION,Ec)}))}so(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Ss(e).put(Rr,t)}static Ye(){return mn.Ye()}io(e){const t=Ss(e);return t.get(Rr).next((r=>this._o(r)?(D(sn,"Releasing primary lease."),t.delete(Rr)):A.resolve()))}uo(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||($e(`Detected an update time that is in the future: ${e} > ${r}`),!1))}Y_(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.K_=()=>{this.Ct.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.J_())))},this.document.addEventListener("visibilitychange",this.K_),this.inForeground=this.document.visibilityState==="visible")}To(){this.K_&&(this.document.removeEventListener("visibilitychange",this.K_),this.K_=null)}Z_(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.q_=()=>{this.ho();const t=/(?:Version|Mobile)\/1[456]/;Mf()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Ct.enterRestrictedMode(!0),this.Ct.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.q_))}Po(){this.q_&&(this.window.removeEventListener("pagehide",this.q_),this.q_=null)}Eo(e){var t;try{const r=((t=this.H_)==null?void 0:t.getItem(this.lo(e)))!==null;return D(sn,`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return $e(sn,"Failed to get zombied client id.",r),!1}}ho(){if(this.H_)try{this.H_.setItem(this.lo(this.clientId),String(Date.now()))}catch(e){$e("Failed to set zombie client id.",e)}}Io(){if(this.H_)try{this.H_.removeItem(this.lo(this.clientId))}catch{}}lo(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Ss(n){return Ae(n,Li)}function ho(n){return Ae(n,Xr)}function gR(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
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
 */class ol{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Vo=r,this.fo=s}static mo(e,t){let r=Q(),s=Q();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new ol(e,t.fromCache,r,s)}}/**
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
 */function _R(n,e){return F.comparator(n.key,e.key)}/**
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
 */class yR{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class Pg{constructor(){this.po=!1,this.yo=!1,this.wo=100,this.bo=(function(){return Mf()?8:Dm(we())>0?6:4})()}initialize(e,t){this.So=e,this.indexManager=t,this.po=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.vo(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.Do(e,t,s,r).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new yR;return this.xo(e,t,o).next((c=>{if(i.result=c,this.yo)return this.Co(e,t,o,c.size)}))})).next((()=>i.result))}Co(e,t,r,s){return ge(t)?A.resolve():r.documentReadCount<this.wo?(xr()<=te.DEBUG&&D("QueryEngine","SDK will not create cache indexes for query:",Bs(t),"since it only creates cache indexes for collection contains","more than or equal to",this.wo,"documents"),A.resolve()):(xr()<=te.DEBUG&&D("QueryEngine","Query:",Bs(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.bo*s?(xr()<=te.DEBUG&&D("QueryEngine","The SDK decides to create cache indexes for query:",Bs(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ot(t))):A.resolve())}vo(e,t){if(ge(t))return A.resolve(null);let r=t;if(Ed(r))return A.resolve(null);let s=ot(r);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(r.limit!==null&&i===1&&(r=zo(r,null,"F"),s=ot(r)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const c=Q(...o);return this.So.getDocuments(e,c).next((u=>this.indexManager.getMinOffset(e,s).next((h=>{const f=this.Fo(r,u);return this.Oo(r,f,c,h.readTime)?this.vo(e,zo(r,null,"F")):this.Mo(e,f,r,h)}))))})))))}Do(e,t,r,s){return(ge(t)?(function(o){for(const c of o.stages){if(c instanceof An||c instanceof Md)return!1;if(c instanceof Ni){if(c.condition instanceof Gm&&c.condition._expr.name==="exists"&&c.condition._expr.params[0]instanceof yr&&c.condition._expr.params[0].fieldName===_t)continue;return!1}}return!0})(t):Ed(t))||s.isEqual(q.min())?A.resolve(null):this.So.getDocuments(e,r).next((i=>{const o=this.Fo(t,i);return this.Oo(t,o,r,s)?A.resolve(null):(xr()<=te.DEBUG&&D("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Ud(t)),this.Mo(e,o,t,OT(s,ri)).next((c=>c)))}))}Fo(e,t){let r,s;return ge(e)?(r=new ie(_R),s=i=>Oa(e,i)):(r=new ie(bu(e)),s=i=>ya(e,i)),t.forEach(((i,o)=>{s(o)&&(r=r.add(o))})),r}Oo(e,t,r,s){if(ge(e))return(function(c){return c.stages.some((u=>u instanceof An||u instanceof Md))})(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}xo(e,t,r){return xr()<=te.DEBUG&&D("QueryEngine","Using full collection scan to execute query:",Ud(t)),this.So.getDocumentsMatchingQuery(e,t,tt.min(),r)}Mo(e,t,r,s){return this.So.getDocumentsMatchingQuery(e,r,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
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
 */const al="LocalStore",IR=3e8;class ER{constructor(e,t,r,s){this.persistence=e,this.No=t,this.serializer=s,this.Lo=new le(H),this.Bo=new Kt((i=>Va(i)),Hu),this.Uo=new Map,this.ko=e.getRemoteDocumentCache(),this.V_=e.getTargetCache(),this.f_=e.getBundleCache(),this.qo(r)}qo(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Rg(this.ko,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.ko.setIndexManager(this.indexManager),this.No.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.Lo)))}}function bg(n,e,t,r){return new ER(n,e,t,r)}async function Sg(n,e){const t=W(n);return await t.persistence.runTransaction("Handle user change","readonly",(r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next((i=>(s=i,t.qo(e),t.mutationQueue.getAllMutationBatches(r)))).next((i=>{const o=[],c=[];let u=Q();for(const h of s){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of i){c.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next((h=>({$o:h,removedBatchIds:o,addedBatchIds:c})))}))}))}function TR(n,e){const t=W(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(r=>{const s=e.batch.keys(),i=t.ko.newChangeBuffer({trackRemovals:!0});return(function(c,u,h,f){const p=h.batch,g=p.keys();let P=A.resolve();return g.forEach((V=>{P=P.next((()=>f.getEntry(u,V))).next((L=>{const k=h.docVersions.get(V);O(k!==null,48541),L.version.compareTo(k)<0&&(p.applyToRemoteDocument(L,h),L.isValidDocument()&&(L.setReadTime(h.commitVersion),f.addEntry(L)))}))})),P.next((()=>c.mutationQueue.removeMutationBatch(u,p)))})(t,r,e,i).next((()=>i.apply(r))).next((()=>t.mutationQueue.performConsistencyCheck(r))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,(function(c){let u=Q();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(u=u.add(c.batch.mutations[h].key));return u})(e)))).next((()=>t.localDocuments.getDocuments(r,s)))}))}function Vg(n){const e=W(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.V_.getLastRemoteSnapshotVersion(t)))}function wR(n,e){const t=W(n),r=e.snapshotVersion;let s=t.Lo;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.ko.newChangeBuffer({trackRemovals:!0});s=t.Lo;const c=[];e.targetChanges.forEach(((f,p)=>{const g=s.get(p);if(!g)return;c.push(t.V_.removeMatchingKeys(i,f.removedDocuments,p).next((()=>t.V_.addMatchingKeys(i,f.addedDocuments,p))));let P=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?P=P.withResumeToken(he.EMPTY_BYTE_STRING,q.min()).withLastLimboFreeSnapshotVersion(q.min()):f.resumeToken.approximateByteSize()>0&&(P=P.withResumeToken(f.resumeToken,r)),s=s.insert(p,P),(function(L,k,$){return L.resumeToken.approximateByteSize()===0||k.snapshotVersion.toMicroseconds()-L.snapshotVersion.toMicroseconds()>=IR?!0:$.addedDocuments.size+$.modifiedDocuments.size+$.removedDocuments.size>0})(g,P,f)&&c.push(t.V_.updateTargetData(i,P))}));let u=Ee(),h=Q();if(e.documentUpdates.forEach((f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))})),c.push(vR(i,o,e.documentUpdates).next((f=>{u=f.Ko,h=f.Qo}))),!r.isEqual(q.min())){const f=t.V_.getLastRemoteSnapshotVersion(i).next((p=>t.V_.setTargetsMetadata(i,i.currentSequenceNumber,r)));c.push(f)}return A.waitFor(c).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,u,h))).next((()=>u))})).then((i=>(t.Lo=s,i)))}function vR(n,e,t){let r=Q(),s=Q();return t.forEach((i=>r=r.add(i))),e.getEntries(n,r).next((i=>{let o=Ee();return t.forEach(((c,u)=>{const h=i.get(c);u.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual(q.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):D(al,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",u.version)})),{Ko:o,Qo:s}}))}function AR(n,e){const t=W(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(r=>(e===void 0&&(e=Yn),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e))))}function RR(n,e){const t=W(n);return t.persistence.runTransaction("Allocate target","readwrite",(r=>{let s;return t.V_.getTargetData(r,e).next((i=>i?(s=i,A.resolve(s)):t.V_.allocateTargetId(r).next((o=>(s=new Tt(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.V_.addTargetData(r,s).next((()=>s)))))))})).then((r=>{const s=t.Lo.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Lo=t.Lo.insert(r.targetId,r),t.Bo.set(e,r.targetId)),r}))}async function eu(n,e,t){const r=W(n),s=r.Lo.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,(o=>r.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!Dn(o))throw o;D(al,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Lo=r.Lo.remove(e),r.Bo.delete(s.target)}function af(n,e,t){const r=W(n);let s=q.min(),i=Q();return r.persistence.runTransaction("Execute query","readwrite",(o=>(function(u,h,f){const p=W(u),g=p.Bo.get(f);return g!==void 0?A.resolve(p.Lo.get(g)):p.V_.getTargetData(h,f)})(r,o,ge(e)?e:ot(e)).next((c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.V_.getMatchingKeysForTargetId(o,c.targetId).next((u=>{i=u}))})).next((()=>r.No.getDocumentsMatchingQuery(o,e,t?s:q.min(),t?i:Q()))).next((c=>(PR(r,c),{documents:c,Wo:i})))))}function PR(n,e){e.forEach(((t,r)=>{const s=r.key.getCollectionGroup(),i=n.Uo.get(s)||q.min();r.readTime.compareTo(i)>0&&n.Uo.set(s,r.readTime)}))}/**
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
 */class bR{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Yo=0,this.Zo=null,this.Xo=!0}ea(){this.Yo===0&&(this.ta("Unknown"),this.Zo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Zo=null,this.na("Backend didn't respond within 10 seconds."),this.ta("Offline"),Promise.resolve()))))}ra(e){this.state==="Online"?this.ta("Unknown"):(this.Yo++,this.Yo>=1&&(this.ia(),this.na(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ta("Offline")))}set(e){this.ia(),this.Yo=0,e==="Online"&&(this.Xo=!1),this.ta(e)}ta(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}na(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Xo?($e(t),this.Xo=!1):D("OnlineStateTracker",t)}ia(){this.Zo!==null&&(this.Zo.cancel(),this.Zo=null)}}/**
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
 */const St="RemoteStore";class SR{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.sa=[],this._a=new Map,this.oa=new Map,this.aa=new Map,this.ua=new zt(1e3),this.ca=new zt(1001),this.la=new Set,this.Ea=[],this.ha=i,this.ha.Qe((o=>{r.enqueueAndForget((async()=>{Er(this)&&(D(St,"Restarting streams for network reachability change."),await(async function(u){const h=W(u);h.la.add(4),await Mi(h),h.Ta.set("Unknown"),h.la.delete(4),await Ma(h)})(this))}))})),this.Ta=new bR(r,s)}}async function Ma(n){if(Er(n))for(const e of n.Ea)await e(!0)}async function Mi(n){for(const e of n.Ea)await e(!1)}function tu(n,e){return n.oa.get(e)||void 0}function Cg(n,e){const t=W(n),r=tu(t,e.targetId);if(r!==void 0&&t._a.has(r))return;const s=(function(c,u){const h=tu(c,u);h!==void 0&&c.aa.delete(h);const f=(function(g,P){return P%2!=0?g.ca.next():g.ua.next()})(c,u);return c.oa.set(u,f),c.aa.set(f,u),f})(t,e.targetId);D(St,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new Tt(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t._a.set(s,i),hl(t)?ll(t):os(t).Yt()&&ul(t,i)}function cl(n,e){const t=W(n),r=os(t),s=tu(t,e);D(St,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t._a.delete(s),t.oa.delete(e),t.aa.delete(s),r.Yt()&&xg(t,s),t._a.size===0&&(r.Yt()?r.en():Er(t)&&t.Ta.set("Unknown"))}function ul(n,e){if(n.Pa.J(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(q.min())>0){const t=n.aa.get(e.targetId);if(t===void 0)return void D(St,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}os(n).Pn(e)}function xg(n,e){n.Pa.J(e),os(n).In(e)}function ll(n){n.Pa=new XT({getRemoteKeysForTarget:e=>{const t=n.aa.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):Q()},ye:e=>n._a.get(e)||null,Ve:()=>n.datastore.serializer.databaseId}),os(n).start(),n.Ta.ea()}function hl(n){return Er(n)&&!os(n).Jt()&&n._a.size>0}function Er(n){return W(n).la.size===0}function Dg(n){n.Pa=void 0}async function VR(n){n.Ta.set("Online")}async function CR(n){n._a.forEach(((e,t)=>{ul(n,e)}))}async function xR(n,e){Dg(n),hl(n)?(n.Ta.ra(e),ll(n)):n.Ta.set("Unknown")}async function DR(n,e,t){if(n.Ta.set("Online"),e instanceof lm&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const c of i.targetIds){if(s._a.has(c)){const u=s.aa.get(c);u!==void 0&&(await s.remoteSyncer.rejectListen(u,o),s.oa.delete(u),s.aa.delete(c)),s._a.delete(c)}s.Pa.removeTarget(c)}})(n,e)}catch(r){D(St,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ta(n,r)}else if(e instanceof vo?n.Pa._e(e):e instanceof um?n.Pa.he(e):n.Pa.ue(e),!t.isEqual(q.min()))try{const r=await Vg(n.localStore);t.compareTo(r)>=0&&await(function(i,o){const c=i.Pa.fe(o);c.targetChanges.forEach(((h,f)=>{if(h.resumeToken.approximateByteSize()>0){const p=i._a.get(f);p&&i._a.set(f,p.withResumeToken(h.resumeToken,o))}})),c.targetMismatches.forEach(((h,f)=>{const p=i._a.get(h);if(!p)return;i._a.set(h,p.withResumeToken(he.EMPTY_BYTE_STRING,p.snapshotVersion)),xg(i,h);const g=new Tt(p.target,h,f,p.sequenceNumber);ul(i,g)}));const u=(function(f,p){const g=new Map;p.targetChanges.forEach(((V,L)=>{const k=f.aa.get(L);k!==void 0&&g.set(k,V)}));let P=new le(H);return p.targetMismatches.forEach(((V,L)=>{const k=f.aa.get(V);k!==void 0&&(P=P.insert(k,L))})),new Si(p.snapshotVersion,g,P,p.documentUpdates,p.augmentedDocumentUpdates,p.resolvedLimboDocuments)})(i,c);return i.remoteSyncer.applyRemoteEvent(u)})(n,t)}catch(r){D(St,"Failed to raise snapshot:",r),await ta(n,r)}}async function ta(n,e,t){if(!Dn(e))throw e;n.la.add(1),await Mi(n),n.Ta.set("Offline"),t||(t=()=>Vg(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{D(St,"Retrying IndexedDB access"),await t(),n.la.delete(1),await Ma(n)}))}function Ng(n,e){return e().catch((t=>ta(n,t,e)))}async function Ui(n){const e=W(n),t=Pn(e);let r=e.sa.length>0?e.sa[e.sa.length-1].batchId:Yn;for(;NR(e);)try{const s=await AR(e.localStore,r);if(s===null){e.sa.length===0&&t.en();break}r=s.batchId,kR(e,s)}catch(s){await ta(e,s)}kg(e)&&Og(e)}function NR(n){return Er(n)&&n.sa.length<10}function kR(n,e){n.sa.push(e);const t=Pn(n);t.Yt()&&t.Rn&&t.An(e.mutations)}function kg(n){return Er(n)&&!Pn(n).Jt()&&n.sa.length>0}function Og(n){Pn(n).start()}async function OR(n){Pn(n).fn()}async function LR(n){const e=Pn(n);for(const t of n.sa)e.An(t.mutations)}async function MR(n,e,t){const r=n.sa.shift(),s=Qu.from(r,e,t);await Ng(n,(()=>n.remoteSyncer.applySuccessfulWrite(s))),await Ui(n)}async function UR(n,e){e&&Pn(n).Rn&&await(async function(r,s){if((function(o){return zT(o)&&o!==C.ABORTED})(s.code)){const i=r.sa.shift();Pn(r).Xt(),await Ng(r,(()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Ui(r)}})(n,e),kg(n)&&Og(n)}async function cf(n,e){const t=W(n);t.asyncQueue.verifyOperationInProgress(),D(St,"RemoteStore received new credentials");const r=Er(t);t.la.add(3),await Mi(t),r&&t.Ta.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.la.delete(3),await Ma(t)}async function FR(n,e){const t=W(n);e?(t.la.delete(2),await Ma(t)):e||(t.la.add(2),await Mi(t),t.Ta.set("Unknown"))}function os(n){return n.Ia||(n.Ia=(function(t,r,s){const i=W(t);return i.pn(),new vw(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:VR.bind(null,n),Et:CR.bind(null,n),Tt:xR.bind(null,n),Tn:DR.bind(null,n)}),n.Ea.push((async e=>{e?(n.Ia.Xt(),hl(n)?ll(n):n.Ta.set("Unknown")):(await n.Ia.stop(),Dg(n))}))),n.Ia}function Pn(n){return n.Ra||(n.Ra=(function(t,r,s){const i=W(t);return i.pn(),new Aw(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(n.datastore,n.asyncQueue,{ct:()=>Promise.resolve(),Et:OR.bind(null,n),Tt:UR.bind(null,n),Vn:LR.bind(null,n),dn:MR.bind(null,n)}),n.Ea.push((async e=>{e?(n.Ra.Xt(),await Ui(n)):(await n.Ra.stop(),n.sa.length>0&&(D(St,`Stopping write stream with ${n.sa.length} pending writes`),n.sa=[]))}))),n.Ra}/**
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
 */class dl{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Aa(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Aa(this.observer.error,e):$e("Uncaught Error in snapshot listener:",e.toString()))}Va(){this.muted=!0}Aa(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */class fl{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Pt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,c=new fl(e,t,o,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(C.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function pl(n,e){if($e("AsyncQueue",`${e}: ${n}`),Dn(n))return new N(C.UNAVAILABLE,`${e}: ${n}`);throw n}const Hs="IndexBackfiller";class BR{constructor(e,t){this.asyncQueue=e,this.Da=t,this.task=null}start(){this.xa(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}xa(e){D(Hs,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.Da.Ca();D(Hs,`Documents written: ${t}`)}catch(t){Dn(t)?D(Hs,"Ignoring IndexedDB error during index backfill: ",t):await gr(t)}await this.xa(6e4)}))}}class qR{constructor(e,t){this.localStore=e,this.persistence=t}async Ca(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.Fa(t,e)))}Fa(e,t){const r=new Set;let s=t,i=!0;return A.doWhile((()=>i===!0&&s>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((o=>{if(o!==null&&!r.has(o))return D(Hs,`Processing collection: ${o}`),this.Oa(e,o,s).next((c=>{s-=c,r.add(o)}));i=!1})))).next((()=>t-s))}Oa(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((s=>this.localStore.localDocuments.getNextDocuments(e,t,s,r).next((i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next((()=>this.Ma(s,i))).next((c=>(D(Hs,`Updating offset: ${c}`),this.localStore.indexManager.updateCollectionGroup(e,t,c)))).next((()=>o.size))}))))}Ma(e,t){let r=e;return t.changes.forEach(((s,i)=>{const o=rm(i);Au(o,r)>0&&(r=o)})),new tt(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}class uf{constructor(){this.activeTargetIds=QT()}Ba(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ua(e){this.activeTargetIds=this.activeTargetIds.delete(e)}La(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Lg{constructor(){this.fu=new uf,this.mu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.fu.Ba(e),this.mu[e]||"not-current"}updateQueryState(e,t,r){this.mu[e]=t}removeLocalQueryTarget(e){this.fu.Ua(e)}isLocalQueryTarget(e){return this.fu.activeTargetIds.has(e)}clearQueryState(e){delete this.mu[e]}getAllActiveQueryTargets(){return this.fu.activeTargetIds}isActiveQueryTarget(e){return this.fu.activeTargetIds.has(e)}start(){return this.fu=new uf,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */function $R(){return typeof window<"u"?window:null}function Vo(){return typeof document<"u"?document:null}/**
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
 */class tr{static emptySet(e){return new tr(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||F.comparator(t.key,r.key):(t,r)=>F.comparator(t.key,r.key),this.keyedMap=Nr(),this.sortedSet=new le(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,r)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof tr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new tr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class lf{constructor(){this.pu=new le(F.comparator)}track(e){const t=e.doc.key,r=this.pu.get(t);r?e.type!==0&&r.type===3?this.pu=this.pu.insert(t,e):e.type===3&&r.type!==1?this.pu=this.pu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.pu=this.pu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.pu=this.pu.remove(t):e.type===1&&r.type===2?this.pu=this.pu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.pu=this.pu.insert(t,{type:2,doc:e.doc}):B(63341,{we:e,gu:r}):this.pu=this.pu.insert(t,e)}yu(){const e=[];return this.pu.inorderTraversal(((t,r)=>{e.push(r)})),e}}class Zr{constructor(e,t,r,s,i,o,c,u,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach((c=>{o.push({type:0,doc:c})})),new Zr(e,t,tr.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Sa(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class jR{constructor(){this.wu=void 0,this.bu=[]}Su(){return this.bu.some((e=>e.vu()))}}class zR{constructor(){this.queries=hf(),this.onlineState="Unknown",this.Du=new Set}terminate(){(function(t,r){const s=W(t),i=s.queries;s.queries=hf(),i.forEach(((o,c)=>{for(const u of c.bu)u.onError(r)}))})(this,new N(C.ABORTED,"Firestore shutting down"))}}function hf(){return new Kt((n=>ng(n)),Sa)}async function ml(n,e){const t=W(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.Su()&&e.vu()&&(r=2):(i=new jR,r=e.vu()?0:1);try{switch(r){case 0:i.wu=await t.onListen(s,!0);break;case 1:i.wu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const c=pl(o,`Initialization of query '${ge(e.query)?Mt(e.query):Bs(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.bu.push(e),e.xu(t.onlineState),i.wu&&e.Cu(i.wu)&&_l(t)}async function gl(n,e){const t=W(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.bu.indexOf(e);o>=0&&(i.bu.splice(o,1),i.bu.length===0?s=e.vu()?0:1:!i.Su()&&e.vu()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function GR(n,e){const t=W(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const c of o.bu)c.Cu(s)&&(r=!0);o.wu=s}}r&&_l(t)}function KR(n,e,t){const r=W(n),s=r.queries.get(e);if(s)for(const i of s.bu)i.onError(t);r.queries.delete(e)}function _l(n){n.Du.forEach((e=>{e.next()}))}var nu;(function(n){n.Default="default",n.Cache="cache"})(nu||(nu={}));class yl{constructor(e,t,r){this.query=e,this.Fu=t,this.Ou=!1,this.Mu=null,this.onlineState="Unknown",this.options=r||{}}Cu(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Zr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Ou?this.Nu(e)&&(this.Fu.next(e),t=!0):this.Lu(e,this.onlineState)&&(this.Bu(e),t=!0),this.Mu=e,t}onError(e){this.Fu.error(e)}xu(e){this.onlineState=e;let t=!1;return this.Mu&&!this.Ou&&this.Lu(this.Mu,e)&&(this.Bu(this.Mu),t=!0),t}Lu(e,t){if(!e.fromCache||!this.vu())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Nu(e){if(e.docChanges.length>0)return!0;const t=this.Mu&&this.Mu.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Bu(e){e=Zr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Ou=!0,this.Fu.next(e)}vu(){return this.options.source!==nu.Cache}}/**
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
 */class Mg{constructor(e){this.key=e}}class Ug{constructor(e){this.key=e}}class HR{constructor(e,t){this.query=e,this.zu=t,this.ju=null,this.hasCachedResults=!1,this.current=!1,this.Hu=Q(),this.mutatedKeys=Q(),this.Ju=ge(e)?Zc(e):bu(e),this.Yu=new tr(this.Ju)}get Zu(){return this.zu}Xu(e,t){const r=t?t.ec:new lf,s=t?t.Yu:this.Yu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,c=!1;const[u,h]=this.tc(this.query,s);e.inorderTraversal(((p,g)=>{const P=s.get(p),V=wg(this.query,g)?g:null,L=!!P&&this.mutatedKeys.has(P.key),k=!!V&&(V.hasLocalMutations||this.mutatedKeys.has(V.key)&&V.hasCommittedMutations);let $=!1;P&&V?P.data.isEqual(V.data)?L!==k&&(r.track({type:3,doc:V}),$=!0):this.nc(P,V)||(r.track({type:2,doc:V}),$=!0,(u&&this.Ju(V,u)>0||h&&this.Ju(V,h)<0)&&(c=!0)):!P&&V?(r.track({type:0,doc:V}),$=!0):P&&!V&&(r.track({type:1,doc:P}),$=!0,(u||h)&&(c=!0)),$&&(V?(o=o.add(V),i=k?i.add(p):i.delete(p)):(o=o.delete(p),i=i.delete(p)))}));const f=this.rc(this.query);if(f)if(ge(this.query)){const p=[];o.forEach((V=>p.push(V)));const g=Tg(this.query,p);let P=new tr(Zc(this.query));for(const V of g)P=P.add(V);o.forEach((V=>{P.has(V.key)||(i=i.delete(V.key),r.track({type:1,doc:V}))})),o=P}else{const p=this.sc(this.query);for(;o.size>f;){const g=p==="F"?o.last():o.first();o=o.delete(g.key),i=i.delete(g.key),r.track({type:1,doc:g})}}return{Yu:o,ec:r,Oo:c,mutatedKeys:i}}rc(e){var t;return ge(e)?(t=_c(e))==null?void 0:t.limit:e.limit||void 0}sc(e){if(ge(e)){const t=_c(e);return t&&t.limit<0?"L":"F"}return e.limitType}tc(e,t){var r;if(ge(e)){const s=(r=_c(e))==null?void 0:r.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.rc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.rc(this.query)?t.first():null]}nc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Yu;this.Yu=e.Yu,this.mutatedKeys=e.mutatedKeys;const o=e.ec.yu();o.sort(((f,p)=>(function(P,V){const L=k=>{switch(k){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return B(20277,{we:k})}};return L(P)-L(V)})(f.type,p.type)||this.Ju(f.doc,p.doc))),this._c(r),s=s??!1;const c=t&&!s?this.oc():[],u=this.Hu.size===0&&this.current&&!s?1:0,h=u!==this.ju;return this.ju=u,o.length!==0||h?{snapshot:new Zr(this.query,e.Yu,i,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),ac:c}:{ac:c}}xu(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Yu:this.Yu,ec:new lf,mutatedKeys:this.mutatedKeys,Oo:!1},!1)):{ac:[]}}uc(e){return!this.zu.has(e)&&!!this.Yu.has(e)&&!this.Yu.get(e).hasLocalMutations}_c(e){e&&(e.addedDocuments.forEach((t=>this.zu=this.zu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.zu=this.zu.delete(t))),this.current=e.current)}oc(){if(!this.current)return[];const e=this.Hu;this.Hu=Q(),this.Yu.forEach((r=>{this.uc(r.key)&&(this.Hu=this.Hu.add(r.key))}));const t=[];return e.forEach((r=>{this.Hu.has(r)||t.push(new Ug(r))})),this.Hu.forEach((r=>{e.has(r)||t.push(new Mg(r))})),t}cc(e){this.zu=e.Wo,this.Hu=Q();const t=this.Xu(e.documents);return this.applyChanges(t,!0)}lc(){return Zr.fromInitialDocuments(this.query,this.Yu,this.mutatedKeys,this.ju===0,this.hasCachedResults)}}const Il="SyncEngine";class WR{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class QR{constructor(e){this.key=e,this.Ec=!1}}class YR{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.hc={},this.Tc=new Kt((c=>ng(c)),Sa),this.Pc=new Map,this.Ic=new Set,this.Rc=new le(F.comparator),this.Ac=new Map,this.Vc=new rl,this.dc={},this.fc=new Map,this.mc=zt.bs(),this.onlineState="Unknown",this.gc=void 0}get isPrimaryClient(){return this.gc===!0}}async function JR(n,e,t=!0){const r=zg(n);let s;const i=r.Tc.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lc()):s=await Fg(r,e,t,!0),s}async function XR(n,e){const t=zg(n);await Fg(t,e,!0,!1)}async function Fg(n,e,t,r){const s=await RR(n.localStore,ge(e)?e:ot(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await ZR(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&Cg(n.remoteStore,s),c}async function ZR(n,e,t,r,s){n.yc=(p,g,P)=>(async function(L,k,$,K){let j=k.view.Xu($);j.Oo&&(j=await af(L.localStore,k.query,!1).then((({documents:E})=>k.view.Xu(E,j))));const X=K&&K.targetChanges.get(k.targetId),J=K&&K.targetMismatches.get(k.targetId)!=null,ee=k.view.applyChanges(j,L.isPrimaryClient,X,J);return ff(L,k.targetId,ee.ac),ee.snapshot})(n,p,g,P);const i=await af(n.localStore,e,!0),o=new HR(e,i.Wo),c=o.Xu(i.documents),u=Vi.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=o.applyChanges(c,n.isPrimaryClient,u);ff(n,t,h.ac);const f=new WR(e,t,o);return n.Tc.set(e,f),n.Pc.has(t)?n.Pc.get(t).push(e):n.Pc.set(t,[e]),h.snapshot}async function eP(n,e,t){const r=W(n),s=r.Tc.get(e),i=r.Pc.get(s.targetId);if(i.length>1)return r.Pc.set(s.targetId,i.filter((o=>!Sa(o,e)))),void r.Tc.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await eu(r.localStore,s.targetId,!1).then((()=>{r.sharedClientState.clearQueryState(s.targetId),t&&cl(r.remoteStore,s.targetId),ru(r,s.targetId)})).catch(gr)):(ru(r,s.targetId),await eu(r.localStore,s.targetId,!0))}async function tP(n,e){const t=W(n),r=t.Tc.get(e),s=t.Pc.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),cl(t.remoteStore,r.targetId))}async function nP(n,e,t){const r=Gg(n);try{const s=await(function(o,c){const u=W(o),h=se.now(),f=c.reduce(((P,V)=>P.add(V.key)),Q());let p,g;return u.persistence.runTransaction("Locally write mutations","readwrite",(P=>{let V=Ee(),L=Q();return u.ko.getEntries(P,f).next((k=>{V=k,V.forEach((($,K)=>{K.isValidDocument()||(L=L.add($))}))})).next((()=>u.localDocuments.getOverlayedDocuments(P,V))).next((k=>{p=k;const $=[];for(const K of c){const j=bT(K,p.get(K.key).overlayedDocument);j!=null&&$.push(new Gt(K.key,j,$p(j.value.mapValue),Se.exists(!0)))}return u.mutationQueue.addMutationBatch(P,h,$,c)})).next((k=>{g=k;const $=k.applyToLocalDocumentSet(p,L);return u.documentOverlayCache.saveOverlays(P,k.batchId,$)}))})).then((()=>({batchId:g.batchId,changes:am(p)})))})(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),(function(o,c,u){let h=o.dc[o.currentUser.toKey()];h||(h=new le(H)),h=h.insert(c,u),o.dc[o.currentUser.toKey()]=h})(r,s.batchId,t),await Fi(r,s.changes),await Ui(r.remoteStore)}catch(s){const i=pl(s,"Failed to persist write");t.reject(i)}}async function Bg(n,e){const t=W(n);try{const r=await wR(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.Ac.get(i);o&&(O(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.Ec=!0:s.modifiedDocuments.size>0?O(o.Ec,14607):s.removedDocuments.size>0&&(O(o.Ec,42227),o.Ec=!1))})),await Fi(t,r,e)}catch(r){await gr(r)}}function df(n,e,t){const r=W(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Tc.forEach(((i,o)=>{const c=o.view.xu(e);c.snapshot&&s.push(c.snapshot)})),(function(o,c){const u=W(o);u.onlineState=c;let h=!1;u.queries.forEach(((f,p)=>{for(const g of p.bu)g.xu(c)&&(h=!0)})),h&&_l(u)})(r.eventManager,e),s.length&&r.hc.Tn(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function rP(n,e,t){const r=W(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Ac.get(e),i=s&&s.key;if(i){let o=new le(F.comparator);o=o.insert(i,fe.newNoDocument(i,q.min()));const c=Q().add(i),u=new Si(q.min(),new Map,new le(H),o,Ee(),c);await Bg(r,u),r.Rc=r.Rc.remove(i),r.Ac.delete(e),El(r)}else await eu(r.localStore,e,!1).then((()=>ru(r,e,t))).catch(gr)}async function sP(n,e){const t=W(n),r=e.batch.batchId;try{const s=await TR(t.localStore,e);$g(t,r,null),qg(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Fi(t,s)}catch(s){await gr(s)}}async function iP(n,e,t){const r=W(n);try{const s=await(function(o,c){const u=W(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",(h=>{let f;return u.mutationQueue.lookupMutationBatch(h,c).next((p=>(O(p!==null,37113),f=p.keys(),u.mutationQueue.removeMutationBatch(h,p)))).next((()=>u.mutationQueue.performConsistencyCheck(h))).next((()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,c))).next((()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f))).next((()=>u.localDocuments.getDocuments(h,f)))}))})(r.localStore,e);$g(r,e,t),qg(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Fi(r,s)}catch(s){await gr(s)}}function qg(n,e){(n.fc.get(e)||[]).forEach((t=>{t.resolve()})),n.fc.delete(e)}function $g(n,e,t){const r=W(n);let s=r.dc[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.dc[r.currentUser.toKey()]=s}}function ru(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Pc.get(e))n.Tc.delete(r),t&&n.hc.wc(r,t);n.Pc.delete(e),n.isPrimaryClient&&n.Vc.e_(e).forEach((r=>{n.Vc.containsKey(r)||jg(n,r)}))}function jg(n,e){n.Ic.delete(e.path.canonicalString());const t=n.Rc.get(e);t!==null&&(cl(n.remoteStore,t),n.Rc=n.Rc.remove(e),n.Ac.delete(t),El(n))}function ff(n,e,t){for(const r of t)r instanceof Mg?(n.Vc.addReference(r.key,e),oP(n,r)):r instanceof Ug?(D(Il,"Document no longer in limbo: "+r.key),n.Vc.removeReference(r.key,e),n.Vc.containsKey(r.key)||jg(n,r.key)):B(19791,{bc:r})}function oP(n,e){const t=e.key,r=t.path.canonicalString();n.Rc.get(t)||n.Ic.has(r)||(D(Il,"New document in limbo: "+t),n.Ic.add(r),El(n))}function El(n){for(;n.Ic.size>0&&n.Rc.size<n.maxConcurrentLimboResolutions;){const e=n.Ic.values().next().value;n.Ic.delete(e);const t=new F(Z.fromString(e)),r=n.mc.next();n.Ac.set(r,new QR(t)),n.Rc=n.Rc.insert(t,r),Cg(n.remoteStore,new Tt(ot(bi(t.path)),r,"TargetPurposeLimboResolution",it.wn))}}async function Fi(n,e,t){const r=W(n),s=[],i=[],o=[];r.Tc.isEmpty()||(r.Tc.forEach(((c,u)=>{o.push(r.yc(u,e,t).then((h=>{var f;if((h||t)&&r.isPrimaryClient){const p=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))==null?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(h){s.push(h);const p=ol.mo(u.targetId,h);i.push(p)}})))})),await Promise.all(o),r.hc.Tn(s),await(async function(u,h){const f=W(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",(p=>A.forEach(h,(g=>A.forEach(g.Vo,(P=>f.persistence.referenceDelegate.addReference(p,g.targetId,P))).next((()=>A.forEach(g.fo,(P=>f.persistence.referenceDelegate.removeReference(p,g.targetId,P)))))))))}catch(p){if(!Dn(p))throw p;D(al,"Failed to update sequence numbers: "+p)}for(const p of h){const g=p.targetId;if(!p.fromCache){const P=f.Lo.get(g),V=P.snapshotVersion,L=P.withLastLimboFreeSnapshotVersion(V);f.Lo=f.Lo.insert(g,L)}}})(r.localStore,i))}async function aP(n,e){const t=W(n);if(!t.currentUser.isEqual(e)){D(Il,"User change. New user:",e.toKey());const r=await Sg(t.localStore,e);t.currentUser=e,(function(i,o){i.fc.forEach((c=>{c.forEach((u=>{u.reject(new N(C.CANCELLED,o))}))})),i.fc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Fi(t,r.$o)}}function cP(n,e){const t=W(n),r=t.Ac.get(e);if(r&&r.Ec)return Q().add(r.key);{let s=Q();const i=t.Pc.get(e);if(!i)return s;for(const o of i??[]){const c=t.Tc.get(o);s=s.unionWith(c.view.Zu)}return s}}function zg(n){const e=W(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Bg.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=cP.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=rP.bind(null,e),e.hc.Tn=GR.bind(null,e.eventManager),e.hc.wc=KR.bind(null,e.eventManager),e}function Gg(n){const e=W(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=sP.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=iP.bind(null,e),e}class mi{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ia(e.databaseInfo.databaseId),this.sharedClientState=this.vc(e),this.persistence=this.Dc(e),await this.persistence.start(),this.localStore=this.xc(e),this.gcScheduler=this.Cc(e,this.localStore),this.indexBackfillerScheduler=this.Fc(e,this.localStore)}Cc(e,t){return null}Fc(e,t){return null}xc(e){return bg(this.persistence,new Pg,e.initialUser,this.serializer)}Dc(e){return new sl(La.b_,this.serializer)}vc(e){return new Lg}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}mi.provider={build:()=>new mi};class uP extends mi{constructor(e){super(),this.cacheSizeBytes=e}Cc(e,t){O(this.persistence.referenceDelegate instanceof ea,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new Nm(r,e.asyncQueue,t)}Dc(e){const t=this.cacheSizeBytes!==void 0?Oe.withCacheSize(this.cacheSizeBytes):Oe.DEFAULT;return new sl((r=>ea.b_(r,t)),this.serializer)}}class lP extends mi{constructor(e,t,r){super(),this.Oc=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Oc.initialize(this,e),await Gg(this.Oc.syncEngine),await Ui(this.Oc.remoteStore),await this.persistence.eo((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}xc(e){return bg(this.persistence,new Pg,e.initialUser,this.serializer)}Cc(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new Nm(r,e.asyncQueue,t)}Fc(e,t){const r=new qR(t,this.persistence);return new BR(e.asyncQueue,r)}Dc(e){const t=gR(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?Oe.withCacheSize(this.cacheSizeBytes):Oe.DEFAULT;return new il(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,$R(),Vo(),this.serializer,this.sharedClientState,!!this.forceOwnership)}vc(e){return new Lg}}class na{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>df(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=aP.bind(null,this.syncEngine),await FR(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new zR})()}createDatastore(e){const t=Ia(e.databaseInfo.databaseId),r=ww(e.databaseInfo);return bw(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return(function(r,s,i,o,c){return new SR(r,s,i,o,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>df(this.syncEngine,t,0)),(function(){return Sd.Ye()?new Sd:new yw})())}createSyncEngine(e,t){return(function(s,i,o,c,u,h,f){const p=new YR(s,i,o,c,u,h);return f&&(p.gc=!0),p})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=W(s);D(St,"RemoteStore shutting down."),i.la.add(5),await Mi(i),i.ha.shutdown(),i.Ta.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}na.provider={build:()=>new na};/**
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
 */const bn="FirestoreClient";class hP{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=s,this.user=Ce.UNAUTHENTICATED,this.clientId=_u.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,(async o=>{D(bn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(r,(o=>(D(bn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Pt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=pl(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}async function Tc(n,e){n.asyncQueue.verifyOperationInProgress(),D(bn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener((async s=>{r.isEqual(s)||(await Sg(e.localStore,s),r=s)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function pf(n,e){n.asyncQueue.verifyOperationInProgress();const t=await dP(n);D(bn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((r=>cf(e.remoteStore,r))),n.setAppCheckTokenChangeListener(((r,s)=>cf(e.remoteStore,s))),n._onlineComponents=e}async function dP(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){D(bn,"Using user provided OfflineComponentProvider");try{await Tc(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===C.FAILED_PRECONDITION||s.code===C.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;ct("Error using user provided cache. Falling back to memory cache: "+t),await Tc(n,new mi)}}else D(bn,"Using default OfflineComponentProvider"),await Tc(n,new uP(void 0));return n._offlineComponents}async function Kg(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(D(bn,"Using user provided OnlineComponentProvider"),await pf(n,n._uninitializedComponentsProvider._online)):(D(bn,"Using default OnlineComponentProvider"),await pf(n,new na))),n._onlineComponents}function fP(n){return Kg(n).then((e=>e.syncEngine))}async function ra(n){const e=await Kg(n),t=e.eventManager;return t.onListen=JR.bind(null,e.syncEngine),t.onUnlisten=eP.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=XR.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=tP.bind(null,e.syncEngine),t}function pP(n,e,t,r){const s=new dl(r),i=new yl(e,s,t);return n.asyncQueue.enqueueAndForget((async()=>ml(await ra(n),i))),()=>{s.Va(),n.asyncQueue.enqueueAndForget((async()=>gl(await ra(n),i)))}}function mP(n,e,t={}){const r=new Pt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,c,u,h){const f=new dl({next:g=>{f.Va(),o.enqueueAndForget((()=>gl(i,p)));const P=g.docs.has(c);!P&&g.fromCache?h.reject(new N(C.UNAVAILABLE,"Failed to get document because the client is offline.")):P&&g.fromCache&&u&&u.source==="server"?h.reject(new N(C.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new yl(bi(c.path),f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return ml(i,p)})(await ra(n),n.asyncQueue,e,t,r))),r.promise}function gP(n,e,t={}){const r=new Pt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,c,u,h){const f=new dl({next:g=>{f.Va(),o.enqueueAndForget((()=>gl(i,p))),g.fromCache&&u.source==="server"?h.reject(new N(C.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new yl(c instanceof js?gA(c):c,f,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return ml(i,p)})(await ra(n),n.asyncQueue,e,t,r))),r.promise}function _P(n,e){const t=new Pt;return n.asyncQueue.enqueueAndForget((async()=>nP(await fP(n),e,t))),t.promise}/**
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
 */let Hg=class{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new pe(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new yP(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field($t("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},yP=class extends Hg{data(){return super.data()}};/**
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
 */class IP{convertValue(e,t="none"){switch(ye(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ce(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(qt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw B(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return xn(e,((s,i)=>{r[s]=this.convertValue(i,t)})),r}convertVectorValue(e){var r,s,i;const t=(i=(s=(r=e.fields)==null?void 0:r[lr].arrayValue)==null?void 0:s.values)==null?void 0:i.map((o=>ce(o.doubleValue)));return new We(t)}convertGeoPoint(e){return new Rt(ce(e.latitude),ce(e.longitude))}convertArray(e,t){return(e.values||[]).map((r=>this.convertValue(r,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ri(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(qr(e));default:return null}}convertTimestamp(e){const t=Bt(e);return new se(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=Z.fromString(e);O(wm(r),9688,{name:e});const s=new ur(r.get(1),r.get(3)),i=new F(r.popFirst(5));return s.isEqual(t)||$e(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */function Tl(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
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
 */const mf="AsyncQueue";class gf{constructor(e=Promise.resolve()){this.$c=[],this.Kc=!1,this.Qc=[],this.Wc=null,this.Gc=!1,this.zc=!1,this.jc=[],this.Ht=new bm(this,"async_queue_retry"),this.Hc=()=>{const r=Vo();r&&D(mf,"Visibility state changed to "+r.visibilityState),this.Ht.$t()},this.Jc=e;const t=Vo();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Hc)}get isShuttingDown(){return this.Kc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Yc(),this.Zc(e)}enterRestrictedMode(e){if(!this.Kc){this.Kc=!0,this.zc=e||!1;const t=Vo();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Hc)}}enqueue(e){if(this.Yc(),this.Kc)return new Promise((()=>{}));const t=new Pt;return this.Zc((()=>this.Kc&&this.zc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.$c.push(e),this.Xc())))}async Xc(){if(this.$c.length!==0){try{await this.$c[0](),this.$c.shift(),this.Ht.reset()}catch(e){if(!Dn(e))throw e;D(mf,"Operation failed with retryable error: "+e)}this.$c.length>0&&this.Ht.kt((()=>this.Xc()))}}Zc(e){const t=this.Jc.then((()=>(this.Gc=!0,e().catch((r=>{throw this.Wc=r,this.Gc=!1,$e("INTERNAL UNHANDLED ERROR: ",_f(r)),r})).then((r=>(this.Gc=!1,r))))));return this.Jc=t,t}enqueueAfterDelay(e,t,r){this.Yc(),this.jc.indexOf(e)>-1&&(t=0);const s=fl.createAndSchedule(this,e,t,r,(i=>this.el(i)));return this.Qc.push(s),s}Yc(){this.Wc&&B(47125,{tl:_f(this.Wc)})}verifyOperationInProgress(){}async nl(){let e;do e=this.Jc,await e;while(e!==this.Jc)}rl(e){for(const t of this.Qc)if(t.timerId===e)return!0;return!1}il(e){return this.nl().then((()=>{this.Qc.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.Qc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.nl()}))}sl(e){this.jc.push(e)}el(e){const t=this.Qc.indexOf(e);this.Qc.splice(t,1)}}function _f(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Vt extends wa{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new gf,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new gf(e),this._firestoreClient=void 0,await e}}}function lb(n,e){const t=typeof n=="object"?n:qf(),r=typeof n=="string"?n:Fo,s=ou(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=B_("firestore");i&&Ow(s,...i)}return s}function Bi(n){if(n._terminated)throw new N(C.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Wg(n),n._firestoreClient}function Wg(n){var r,s,i,o;const e=n._freezeSettings(),t=Vw(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(s=n._app)==null?void 0:s.options.apiKey,e);n._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new hP(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(u){const h=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(h),_online:h}})(n._componentsProvider))}function hb(n,e){ct("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=n._freezeSettings();return EP(n,na.provider,{build:r=>new lP(r,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}function EP(n,e,t){if((n=He(n,Vt))._firestoreClient||n._terminated)throw new N(C.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(n._componentsProvider||n._getSettings().localCache)throw new N(C.FAILED_PRECONDITION,"SDK cache is already specified.");n._componentsProvider={_online:e,_offline:t},Wg(n)}/**
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
 */class wl extends IP{constructor(e){super(),this.firestore=e}convertBytes(e){return new st(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new pe(this.firestore,null,t)}}class Os{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class nr extends Hg{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Co(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field($t("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new N(C.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=nr._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}nr._jsonSchemaVersion="firestore/documentSnapshot/1.0",nr._jsonSchema={type:_e("string",nr._jsonSchemaVersion),bundleSource:_e("string","DocumentSnapshot"),bundleName:_e("string"),bundle:_e("string")};class Co extends nr{data(e={}){return super.data(e)}}class rr{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Os(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new Co(this._firestore,this._userDataWriter,r.key,r,new Os(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new N(C.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((c=>{ge(s._snapshot.query)?Zc(s._snapshot.query):bu(s.query._query);const u=new Co(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Os(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((c=>i||c.type!==3)).map((c=>{const u=new Co(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Os(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),f=o.indexOf(c.doc.key)),{type:TP(c.type),doc:u,oldIndex:h,newIndex:f}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new N(C.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=rr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=_u.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function TP(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return B(61501,{type:n})}}/**
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
 */rr._jsonSchemaVersion="firestore/querySnapshot/1.0",rr._jsonSchema={type:_e("string",rr._jsonSchemaVersion),bundleSource:_e("string","QuerySnapshot"),bundleName:_e("string"),bundle:_e("string")};/**
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
 */function Qg(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new N(C.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class vl{}class Al extends vl{}function db(n,e,...t){let r=[];e instanceof vl&&r.push(e),r=r.concat(t),(function(i){const o=i.filter((u=>u instanceof Rl)).length,c=i.filter((u=>u instanceof Ua)).length;if(o>1||o>0&&c>0)throw new N(C.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(r);for(const s of r)n=s._apply(n);return n}class Ua extends Al{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Ua(e,t,r)}_apply(e){const t=this._parse(e);return Yg(e._query,t),new Ht(e.firestore,e.converter,Uc(e._query,t))}_parse(e){const t=va(e.firestore);return(function(i,o,c,u,h,f,p){let g;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new N(C.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){If(p,f);const V=[];for(const L of p)V.push(yf(u,i,L));g={arrayValue:{values:V}}}else g=yf(u,i,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||If(p,f),g=$w(c,o,p,f==="in"||f==="not-in");return ne.create(h,f,g)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function fb(n,e,t){const r=e,s=$t("where",n);return Ua._create(s,r,t)}class Rl extends vl{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Rl(e,t)}_parse(e){const t=this._queryConstraints.map((r=>r._parse(e))).filter((r=>r.getFilters().length>0));return t.length===1?t[0]:oe.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let o=s;const c=i.getFlattenedFilters();for(const u of c)Yg(o,u),o=Uc(o,u)})(e._query,t),new Ht(e.firestore,e.converter,Uc(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Pl extends Al{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Pl(e,t)}_apply(e){const t=(function(s,i,o){if(s.startAt!==null)throw new N(C.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new N(C.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ni(i,o)})(e._query,this._field,this._direction);return new Ht(e.firestore,e.converter,BT(e._query,t))}}function pb(n,e="asc"){const t=e,r=$t("orderBy",n);return Pl._create(r,t)}class bl extends Al{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new bl(e,t,r)}_apply(e){return new Ht(e.firestore,e.converter,zo(e._query,this._limit,this._limitType))}}function mb(n){return bl._create("limit",n,"F")}function yf(n,e,t){if(typeof(t=ve(t))=="string"){if(t==="")throw new N(C.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!sm(e)&&t.indexOf("/")!==-1)throw new N(C.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(Z.fromString(t));if(!F.isDocumentKey(r))throw new N(C.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Zs(n,new F(r))}if(t instanceof pe)return Zs(n,t._key);throw new N(C.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ha(t)}.`)}function If(n,e){if(!Array.isArray(n)||n.length===0)throw new N(C.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Yg(n,e){const t=(function(s,i){for(const o of s)for(const c of o.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new N(C.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new N(C.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}/**
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
 */function Ef(n){return(function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
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
 */class wP{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=va(e)}set(e,t,r){this._verifyNotCommitted();const s=wc(e,this._firestore),i=Tl(s.converter,t,r),o=Nu(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,Se.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=wc(e,this._firestore);let o;return o=typeof(t=ve(t))=="string"||t instanceof Ea?qw(this._dataReader,"WriteBatch.update",i._key,t,r,s):Bw(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,Se.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=wc(e,this._firestore);return this._mutations=this._mutations.concat(new Pi(t._key,Se.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new N(C.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function wc(n,e){if((n=ve(n)).firestore!==e)throw new N(C.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
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
 */function gb(n){n=He(n,pe);const e=He(n.firestore,Vt),t=Bi(e);return mP(t,n._key).then((r=>Jg(e,n,r)))}function _b(n){n=He(n,Ht);const e=He(n.firestore,Vt),t=Bi(e),r=new wl(e);return Qg(n._query),gP(t,n._query).then((s=>new rr(e,r,n,s)))}function yb(n,e,t){n=He(n,pe);const r=He(n.firestore,Vt),s=Tl(n.converter,e,t),i=va(r);return Fa(r,[Nu(i,"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,Se.none())])}function Ib(n){return Fa(He(n.firestore,Vt),[new Pi(n._key,Se.none())])}function Eb(n,e){const t=He(n.firestore,Vt),r=Lw(n),s=Tl(n.converter,e),i=va(n.firestore);return Fa(t,[Nu(i,"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,Se.exists(!1))]).then((()=>r))}function Tb(n,...e){var h,f,p;n=ve(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||Ef(e[r])||(t=e[r++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Ef(e[r])){const g=e[r];e[r]=(h=g.next)==null?void 0:h.bind(g),e[r+1]=(f=g.error)==null?void 0:f.bind(g),e[r+2]=(p=g.complete)==null?void 0:p.bind(g)}let i,o,c;if(n instanceof pe)o=He(n.firestore,Vt),c=bi(n._key.path),i={next:g=>{e[r]&&e[r](Jg(o,n,g))},error:e[r+1],complete:e[r+2]};else{const g=He(n,Ht);o=He(g.firestore,Vt),c=g._query;const P=new wl(o);i={next:V=>{e[r]&&e[r](new rr(o,P,g,V))},error:e[r+1],complete:e[r+2]},Qg(n._query)}const u=Bi(o);return pP(u,c,s,i)}function Fa(n,e){const t=Bi(n);return _P(t,e)}function Jg(n,e,t){const r=t.docs.get(e._key),s=new wl(n);return new nr(n,s,e._key,r,new Os(t.hasPendingWrites,t.fromCache),e.converter)}function wb(n){return n=He(n,Vt),Bi(n),new wP(n,(e=>Fa(n,e)))}const Tf="@firebase/firestore",wf="4.17.2";(function(e,t=!0){cT(mr),ir(new In("firestore",((r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),c=new Vt(new pw(r.getProvider("auth-internal")),new _w(o,r.getProvider("app-check-internal")),_T(o,s),o);return i={useFetchStreams:t,...i},c._setSettings(i),c}),"PUBLIC").setMultipleInstances(!0)),wt(Tf,wf,e),wt(Tf,wf,"esm2020")})();/**
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
 */const Xg="firebasestorage.googleapis.com",vP="storageBucket",AP=120*1e3,RP=600*1e3;/**
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
 */class Dt extends xt{constructor(e,t,r=0){super(vc(e),`Firebase Storage: ${t} (${vc(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Dt.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return vc(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Ct;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Ct||(Ct={}));function vc(n){return"storage/"+n}function PP(){const n="An unknown error occurred, please check the error payload for server response.";return new Dt(Ct.UNKNOWN,n)}function bP(){return new Dt(Ct.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function SP(){return new Dt(Ct.CANCELED,"User canceled the upload/download.")}function VP(n){return new Dt(Ct.INVALID_URL,"Invalid URL '"+n+"'.")}function CP(n){return new Dt(Ct.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function vf(n){return new Dt(Ct.INVALID_ARGUMENT,n)}function Zg(){return new Dt(Ct.APP_DELETED,"The Firebase app was deleted.")}function xP(n){return new Dt(Ct.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
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
 */class dt{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=dt.makeFromUrl(e,t)}catch{return new dt(e,"")}if(r.path==="")return r;throw CP(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(X){X.path.charAt(X.path.length-1)==="/"&&(X.path_=X.path_.slice(0,-1))}const o="(/(.*))?$",c=new RegExp("^gs://"+s+o,"i"),u={bucket:1,path:3};function h(X){X.path_=decodeURIComponent(X.path)}const f="v[A-Za-z0-9_]+",p=t.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",P=new RegExp(`^https?://${p}/${f}/b/${s}/o${g}`,"i"),V={bucket:1,path:3},L=t===Xg?"(?:storage.googleapis.com|storage.cloud.google.com)":t,k="([^?#]*)",$=new RegExp(`^https?://${L}/${s}/${k}`,"i"),j=[{regex:c,indices:u,postModify:i},{regex:P,indices:V,postModify:h},{regex:$,indices:{bucket:1,path:2},postModify:h}];for(let X=0;X<j.length;X++){const J=j[X],ee=J.regex.exec(e);if(ee){const E=ee[J.indices.bucket];let _=ee[J.indices.path];_||(_=""),r=new dt(E,_),J.postModify(r);break}}if(r==null)throw VP(e);return r}}class DP{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
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
 */function NP(n,e,t){let r=1,s=null,i=null,o=!1,c=0;function u(){return c===2}let h=!1;function f(...k){h||(h=!0,e.apply(null,k))}function p(k){s=setTimeout(()=>{s=null,n(P,u())},k)}function g(){i&&clearTimeout(i)}function P(k,...$){if(h){g();return}if(k){g(),f.call(null,k,...$);return}if(u()||o){g(),f.call(null,k,...$);return}r<64&&(r*=2);let j;c===1?(c=2,j=0):j=(r+Math.random())*1e3,p(j)}let V=!1;function L(k){V||(V=!0,g(),!h&&(s!==null?(k||(c=2),clearTimeout(s),p(0)):k||(c=1)))}return p(0),i=setTimeout(()=>{o=!0,L(!0)},t),L}function kP(n){n(!1)}/**
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
 */function OP(n){return n!==void 0}function Af(n,e,t,r){if(r<e)throw vf(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw vf(`Invalid value for '${n}'. Expected ${t} or less.`)}function LP(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var sa;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(sa||(sa={}));/**
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
 */function MP(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||s||i}/**
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
 */class UP{constructor(e,t,r,s,i,o,c,u,h,f,p,g=!0,P=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=c,this.errorCallback_=u,this.timeout_=h,this.progressCallback_=f,this.connectionFactory_=p,this.retry=g,this.isUsingEmulator=P,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((V,L)=>{this.resolve_=V,this.reject_=L,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new fo(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=c=>{const u=c.loaded,h=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,h)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const c=i.getErrorCode()===sa.NO_ERROR,u=i.getStatus();if(!c||MP(u,this.additionalRetryCodes_)&&this.retry){const f=i.getErrorCode()===sa.ABORT;r(!1,new fo(!1,null,f));return}const h=this.successCodes_.indexOf(u)!==-1;r(!0,new fo(h,i))})},t=(r,s)=>{const i=this.resolve_,o=this.reject_,c=s.connection;if(s.wasSuccessCode)try{const u=this.callback_(c,c.getResponse());OP(u)?i(u):i()}catch(u){o(u)}else if(c!==null){const u=PP();u.serverResponse=c.getErrorText(),this.errorCallback_?o(this.errorCallback_(c,u)):o(u)}else if(s.canceled){const u=this.appDelete_?Zg():SP();o(u)}else{const u=bP();o(u)}};this.canceled_?t(!1,new fo(!1,null,!0)):this.backoffId_=NP(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&kP(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class fo{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function FP(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function BP(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function qP(n,e){e&&(n["X-Firebase-GMPID"]=e)}function $P(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function jP(n,e,t,r,s,i,o=!0,c=!1){const u=LP(n.urlParams),h=n.url+u,f=Object.assign({},n.headers);return qP(f,e),FP(f,t),BP(f,i),$P(f,r),new UP(h,n.method,f,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,o,c)}/**
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
 */function zP(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function GP(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
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
 */class ia{constructor(e,t){this._service=e,t instanceof dt?this._location=t:this._location=dt.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new ia(e,t)}get root(){const e=new dt(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return GP(this._location.path)}get storage(){return this._service}get parent(){const e=zP(this._location.path);if(e===null)return null;const t=new dt(this._location.bucket,e);return new ia(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw xP(e)}}function Rf(n,e){const t=e==null?void 0:e[vP];return t==null?null:dt.makeFromBucketSpec(t,n)}class KP{constructor(e,t,r,s,i,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=Xg,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=AP,this._maxUploadRetryTime=RP,this._requests=new Set,s!=null?this._bucket=dt.makeFromBucketSpec(s,this._host):this._bucket=Rf(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=dt.makeFromBucketSpec(this._url,e):this._bucket=Rf(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){Af("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){Af("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(Ge(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new ia(this,e)}_makeRequest(e,t,r,s,i=!0){if(this._deleted)return new DP(Zg());{const o=jP(e,this._appId,r,s,t,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const Pf="@firebase/storage",bf="0.14.5";/**
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
 */const HP="storage";/**
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
 */function WP(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new KP(t,r,s,e,mr)}function QP(){ir(new In(HP,WP,"PUBLIC").setMultipleInstances(!0)),wt(Pf,bf,""),wt(Pf,bf,"esm2020")}QP();export{cn as G,Ib as a,JP as b,ib as c,Lw as d,hb as e,gb as f,lb as g,_b as h,qy as i,nb as j,ob as k,ab as l,eb as m,ZP as n,Tb as o,tb as p,XP as q,db as r,yb as s,fb as t,pb as u,mb as v,wb as w,Eb as x};
