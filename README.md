# OrangeMonkey - Artlist Downloader **`v2.7`**

> [!WARNING]
> **Please read Artlist's [Terms of Service](https://artlist.io/help-center/privacy-terms/terms-of-use/) before using this script.**
> This script is intended for personal use only to listen to music offline. Use responsibly.

> [!IMPORTANT]
> This userscript enables you to download **music** and **sound effects** from Artlist.io without requiring an account or dealing with watermarks. The script automatically modifies download buttons to bypass account requirements and download audio files directly.

## 🚀 Quick Installation

[**INSTALL USERSCRIPT**](https://github.com/sulmanfarooqq/OrangeMonkey/raw/main/artlist-downloader.user.js)

### Prerequisites
You need a userscript manager extension:

- **[TamperMonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)**
- **[OrangeMonkey](https://chromewebstore.google.com/detail/orangemonkey/ekmeppjgajofkpiofbebgcbohbmfldaf)** (Recommended)

## 📖 How It Works

The script works by:

1. **Intercepting API requests** to Artlist's backend to capture audio metadata
2. **Modifying download buttons** by:
   - Changing button colors (green for music, pink for sound effects)
   - Adding custom click handlers that bypass account requirements
   - Directly downloading audio files instead of showing signup prompts
3. **Supporting multiple page types**:
   - Music browsing pages (`artlist.io/royalty-free-music`)
   - Sound effects pages (`artlist.io/sfx`)
   - Individual song/sound effect pages
   - Song stem pages (downloads as ZIP)

## 🎯 Features

- ✅ **No account required** - Bypasses Artlist account system
- ✅ **No watermarks** - Downloads original audio files
- ✅ **Automatic detection** - Works on various Artlist page layouts
- ✅ **Batch downloading** - Download multiple stems as ZIP files
- ✅ **Organized filenames** - Files named as `Artist - Song Name (ID).aac`

## 🛠️ Manual Installation

1. Install a userscript manager (OrangeMonkey recommended)
2. Click the installation link above or:
   - Create new script in your userscript manager
   - Copy contents of `artlist-downloader.user.js` (the main script file)
   - Save the script

## 🔧 Usage

1. Visit any Artlist.io page (music or sound effects)
2. Wait for buttons to change color (indicates script is active)
3. Click any download button
4. Save the audio file through your browser's download prompt

## 🎨 Button Colors

- **Green buttons** (`#82ff59`) - Music downloads
- **Pink buttons** (`#ff90bf`) - Sound effect downloads  
- **Red buttons** (`#ff3333`) - Error state (script couldn't process)

## ⚠️ Troubleshooting

If buttons aren't working:
- Refresh the page
- Ensure userscript manager is enabled for Artlist.io
- Check script is enabled in your userscript manager
- Some pages may take a few seconds to load and modify buttons

## 🐛 Reporting Issues

Use the [bug report template](.github/ISSUE_TEMPLATE/bug-report.md) and provide:
- Userscript manager used
- Browser and version
- Exact URL where issue occurs

## 📄 License

BSD 3-Clause License - See [LICENSE](LICENSE) file for details.

---

> ⭐ **Also checkout the master brach, master brach contain a python cli based agent for downloading free music from the epidemic the most popular and favouite website for downloading free and fast music, also have a code to download all your favorite songs just in a 1 click** ⭐


> **GO to master branch [Click me to checkout](https://github.com/sulmanfarooqq/OrangeMonkey/tree/master) Read the readme file for full guide.**

