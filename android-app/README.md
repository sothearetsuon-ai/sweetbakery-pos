# គម្រោង SweetBakery POS សម្រាប់ Android (Android Studio Project)

គម្រោងនេះជា Native Android Application (WebView + TWA) ដែលត្រូវគ្នាជាមួយ **Android Studio** សម្រាប់ compile ចេញជា File **`.apk`** យកទៅដំឡើងលើទូរស័ព្ទ Android ណាក៏បាន។

---

### លក្ខណៈពិសេសក្នុង Android App
1. 🔄 **Auto-Update ស្វ័យប្រវត្តិ ១០០%**៖ App ភ្ជាប់ទៅ Server Firebase (`https://sweetbakery-8040d.web.app`)។ ពេលអ្នកកែប្រែ Code លើ Server នោះទូរស័ព្ទនឹងអាប់ដេតតាមភ្លាមៗ។
2. ⬇️ **ទាញចុះក្រោមដើម្បី Refresh (Pull-to-Refresh)**៖ អាចអូសអេក្រង់ចុះក្រោមដើម្បី Reload ទិន្នន័យ។
3. 📸 **គាំទ្រការ Upload រូបថត & កាមេរ៉ា**៖ អាចថតរូប ឬរើសរូបនំខេកដាក់ក្នុងប្រព័ន្ធបាន។
4. 📡 **ផ្ទាំងជំនួយពេលដាច់អ៊ីនធឺណិត (Offline Screen)**៖ បង្ហាញសារជាភាសាខ្មែរ និងមានប៊ូតុងព្យាយាមម្តងទៀត។
5. 🔙 **ប៊ូតុងត្រឡប់ក្រោយ (Back Button)**៖ ចុច Back វានឹងថយទៅទំព័រមុនក្នុង App មិនមែនចាកចេញភ្លាមៗឡើយ។

---

### របៀប Build ចេញជា File `.apk` តាម Android Studio
1. បើកកម្មវិធី **Android Studio**
2. ចុច **Open** រួចជ្រើសរើស Folder៖
   ```text
   android-app
   ```
3. រង់ចាំ Android Studio ធ្វើការ Sync Gradle រយៈពេលប្រហែល ១-២ នាទី
4. ចូលទៅកាន់ Menu ខាងលើ៖
   * **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**
5. នៅពេល Build រួចរាល់ វានឹងលោតពាក្យ **[locate]** នៅជ្រុងខាងក្រោមស្តាំ។ ចុចលើវាដើម្បីយក File `.apk` ទៅប្រើប្រាស់ភ្លាមៗ!
