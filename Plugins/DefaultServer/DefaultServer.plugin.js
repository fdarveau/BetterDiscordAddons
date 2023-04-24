/**
 * @name DefaultServer
 * @author fdarveau
 * @authorId 135110300205711360
 * @version 1.0.0
 * @description Sets a default server when launching Discord instead of the "Friends" 
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DefaultServer/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/DefaultServer/DefaultServer.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		var selectedServer;
	
		return class DefaultServer extends Plugin {
			onLoad () {
				_this = this;
			}
			
			onStart () {
				let defaultServer = BDFDB.DataUtils.load(this, "selectedServer");
				if (defaultServer) {
					document.querySelector(`[data-list-item-id='guildsnav___${defaultServer}'`).click()
				}
			}
			
			onStop () {
				// Nothing to do
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				let listInstance = null

				// Making a copy is required so there are no side effects to the global getFlattenedGuildIds() array, which apparently re-uses the same array everytime.
				const allServerIds = [...new Set(BDFDB.LibraryModules.SortedGuildUtils.getFlattenedGuildIds())];

				// Do not be fooled by the BDFDB.ArrayUtils.remove signature. It returns an array, which is the input array that has been modified. 
				// Sending a copy as input allows keeping the original array (required later) intact.
				let disabledServers = [...new Set(allServerIds)]
				BDFDB.ArrayUtils.remove(disabledServers, BDFDB.DataUtils.load(this, "selectedServer"));

				settingsItems.push(BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.settingsrowcontainer,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsGuildList, {
							className: BDFDB.disCN.marginbottom20,
							disabled: disabledServers,
							onClick: deselectedServersIds => {
								let selectedServersIds = [...new Set(allServerIds)];
								deselectedServersIds.forEach(deselectedServerId => {
									BDFDB.ArrayUtils.remove(selectedServersIds, deselectedServerId);
								});
								this.saveSelectedServer(selectedServersIds);
							},
							ref: instance => {listInstance = instance;}
						}),
					]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
				}
			}
			
			saveSelectedServer (selectedServers) {
				if (selectedServers.length > 1) {
					BdApi.alert("Invalid setting", "Only one server can be selected as the default server. If multiple servers are selected, the first one will be the default server.");
				}
				selectedServer = selectedServers[0];
				// BdApi.showToast(`${selectedServer} is now the default Server`);
				BDFDB.DataUtils.save(selectedServer, this, "selectedServer");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();