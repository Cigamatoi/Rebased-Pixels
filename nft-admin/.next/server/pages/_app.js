/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _iota_dapp_kit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @iota/dapp-kit */ \"@iota/dapp-kit\");\n/* harmony import */ var _iota_iota_sdk_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @iota/iota-sdk/client */ \"@iota/iota-sdk/client\");\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var react_toastify__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-toastify */ \"react-toastify\");\n/* harmony import */ var react_toastify_dist_ReactToastify_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-toastify/dist/ReactToastify.css */ \"./node_modules/react-toastify/dist/ReactToastify.css\");\n/* harmony import */ var react_toastify_dist_ReactToastify_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_toastify_dist_ReactToastify_css__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _iota_dapp_kit_dist_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @iota/dapp-kit/dist/index.css */ \"./node_modules/@iota/dapp-kit/dist/esm/index.css\");\n/* harmony import */ var _iota_dapp_kit_dist_index_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_iota_dapp_kit_dist_index_css__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_7__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_iota_dapp_kit__WEBPACK_IMPORTED_MODULE_1__, _iota_iota_sdk_client__WEBPACK_IMPORTED_MODULE_2__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__, react_toastify__WEBPACK_IMPORTED_MODULE_4__]);\n([_iota_dapp_kit__WEBPACK_IMPORTED_MODULE_1__, _iota_iota_sdk_client__WEBPACK_IMPORTED_MODULE_2__, _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__, react_toastify__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\n\n\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__.QueryClient();\n// Konfiguriere die Netzwerke, zu denen du dich verbinden möchtest\nconst { networkConfig } = (0,_iota_dapp_kit__WEBPACK_IMPORTED_MODULE_1__.createNetworkConfig)({\n    testnet: {\n        url: (0,_iota_iota_sdk_client__WEBPACK_IMPORTED_MODULE_2__.getFullnodeUrl)(\"testnet\")\n    }\n});\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_3__.QueryClientProvider, {\n        client: queryClient,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_iota_dapp_kit__WEBPACK_IMPORTED_MODULE_1__.IotaClientProvider, {\n            networks: networkConfig,\n            defaultNetwork: \"testnet\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_iota_dapp_kit__WEBPACK_IMPORTED_MODULE_1__.WalletProvider, {\n                autoConnect: true,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                        ...pageProps\n                    }, void 0, false, {\n                        fileName: \"D:\\\\reference-project\\\\rebasedpixels\\\\nft-admin\\\\src\\\\pages\\\\_app.tsx\",\n                        lineNumber: 22,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_toastify__WEBPACK_IMPORTED_MODULE_4__.ToastContainer, {\n                        position: \"bottom-right\"\n                    }, void 0, false, {\n                        fileName: \"D:\\\\reference-project\\\\rebasedpixels\\\\nft-admin\\\\src\\\\pages\\\\_app.tsx\",\n                        lineNumber: 23,\n                        columnNumber: 11\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"D:\\\\reference-project\\\\rebasedpixels\\\\nft-admin\\\\src\\\\pages\\\\_app.tsx\",\n                lineNumber: 21,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"D:\\\\reference-project\\\\rebasedpixels\\\\nft-admin\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 20,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"D:\\\\reference-project\\\\rebasedpixels\\\\nft-admin\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 19,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDeUY7QUFDbEM7QUFDa0I7QUFDekI7QUFDRDtBQUNSO0FBQ1I7QUFFL0IsTUFBTU8sY0FBYyxJQUFJSCw4REFBV0E7QUFFbkMsa0VBQWtFO0FBQ2xFLE1BQU0sRUFBRUksYUFBYSxFQUFFLEdBQUdQLG1FQUFtQkEsQ0FBQztJQUM1Q1EsU0FBUztRQUFFQyxLQUFLUCxxRUFBY0EsQ0FBQztJQUFXO0FBQzVDO0FBRUEsU0FBU1EsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBWTtJQUMvQyxxQkFDRSw4REFBQ1Isc0VBQW1CQTtRQUFDUyxRQUFRUDtrQkFDM0IsNEVBQUNMLDhEQUFrQkE7WUFBQ2EsVUFBVVA7WUFBZVEsZ0JBQWU7c0JBQzFELDRFQUFDaEIsMERBQWNBO2dCQUFDaUIsV0FBVzs7a0NBQ3pCLDhEQUFDTDt3QkFBVyxHQUFHQyxTQUFTOzs7Ozs7a0NBQ3hCLDhEQUFDUCwwREFBY0E7d0JBQUNZLFVBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLbkM7QUFFQSxpRUFBZVAsS0FBS0EsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3JlYmFzZWQtcGl4ZWxzLW5mdC1hZG1pbi8uL3NyYy9wYWdlcy9fYXBwLnRzeD9mOWQ2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xyXG5pbXBvcnQgeyBXYWxsZXRQcm92aWRlciwgY3JlYXRlTmV0d29ya0NvbmZpZywgSW90YUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQGlvdGEvZGFwcC1raXQnO1xyXG5pbXBvcnQgeyBnZXRGdWxsbm9kZVVybCB9IGZyb20gJ0Bpb3RhL2lvdGEtc2RrL2NsaWVudCc7XHJcbmltcG9ydCB7IFF1ZXJ5Q2xpZW50LCBRdWVyeUNsaWVudFByb3ZpZGVyIH0gZnJvbSAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JztcclxuaW1wb3J0IHsgVG9hc3RDb250YWluZXIgfSBmcm9tICdyZWFjdC10b2FzdGlmeSc7XHJcbmltcG9ydCAncmVhY3QtdG9hc3RpZnkvZGlzdC9SZWFjdFRvYXN0aWZ5LmNzcyc7XHJcbmltcG9ydCAnQGlvdGEvZGFwcC1raXQvZGlzdC9pbmRleC5jc3MnO1xyXG5pbXBvcnQgJy4uL3N0eWxlcy9nbG9iYWxzLmNzcyc7XHJcblxyXG5jb25zdCBxdWVyeUNsaWVudCA9IG5ldyBRdWVyeUNsaWVudCgpO1xyXG5cclxuLy8gS29uZmlndXJpZXJlIGRpZSBOZXR6d2Vya2UsIHp1IGRlbmVuIGR1IGRpY2ggdmVyYmluZGVuIG3DtmNodGVzdFxyXG5jb25zdCB7IG5ldHdvcmtDb25maWcgfSA9IGNyZWF0ZU5ldHdvcmtDb25maWcoe1xyXG4gIHRlc3RuZXQ6IHsgdXJsOiBnZXRGdWxsbm9kZVVybCgndGVzdG5ldCcpIH0sXHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xyXG4gIHJldHVybiAoXHJcbiAgICA8UXVlcnlDbGllbnRQcm92aWRlciBjbGllbnQ9e3F1ZXJ5Q2xpZW50fT5cclxuICAgICAgPElvdGFDbGllbnRQcm92aWRlciBuZXR3b3Jrcz17bmV0d29ya0NvbmZpZ30gZGVmYXVsdE5ldHdvcms9XCJ0ZXN0bmV0XCI+XHJcbiAgICAgICAgPFdhbGxldFByb3ZpZGVyIGF1dG9Db25uZWN0PlxyXG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgICAgICAgPFRvYXN0Q29udGFpbmVyIHBvc2l0aW9uPVwiYm90dG9tLXJpZ2h0XCIgLz5cclxuICAgICAgICA8L1dhbGxldFByb3ZpZGVyPlxyXG4gICAgICA8L0lvdGFDbGllbnRQcm92aWRlcj5cclxuICAgIDwvUXVlcnlDbGllbnRQcm92aWRlcj5cclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNeUFwcDsgIl0sIm5hbWVzIjpbIldhbGxldFByb3ZpZGVyIiwiY3JlYXRlTmV0d29ya0NvbmZpZyIsIklvdGFDbGllbnRQcm92aWRlciIsImdldEZ1bGxub2RlVXJsIiwiUXVlcnlDbGllbnQiLCJRdWVyeUNsaWVudFByb3ZpZGVyIiwiVG9hc3RDb250YWluZXIiLCJxdWVyeUNsaWVudCIsIm5ldHdvcmtDb25maWciLCJ0ZXN0bmV0IiwidXJsIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJjbGllbnQiLCJuZXR3b3JrcyIsImRlZmF1bHROZXR3b3JrIiwiYXV0b0Nvbm5lY3QiLCJwb3NpdGlvbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@iota/dapp-kit":
/*!*********************************!*\
  !*** external "@iota/dapp-kit" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = import("@iota/dapp-kit");;

/***/ }),

/***/ "@iota/iota-sdk/client":
/*!****************************************!*\
  !*** external "@iota/iota-sdk/client" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@iota/iota-sdk/client");;

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "react-toastify":
/*!*********************************!*\
  !*** external "react-toastify" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-toastify");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/react-toastify","vendor-chunks/@iota"], () => (__webpack_exec__("./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();