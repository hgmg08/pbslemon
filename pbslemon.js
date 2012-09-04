function pbslemon_application(checknum, pid, args) {
	var app = new eyeos.application.pbslemon(checknum, pid, args);
	app.open();
}

qx.Class.define('eyeos.application.pbslemon', {
	extend: eyeos.system.EyeApplication,

	statics: {
		DEFAULT_WIDTH: 665,
		DEFAULT_HEIGHT: 500
	},

	construct: function(checknum, pid, args) {
		arguments.callee.base.call(this, 'pbslemon', checknum, pid);
		
		this._drawGUI();

		this._window.addListener('appear', function(e) {
			this._refreshJobTable();
		}, this);
	},

	members: {
		_window: null,
		_jobTable: null,

		_drawGUI: function() {
			this._window = new eyeos.ui.Window(this, 'PBS Lemon', 
					'index.php?extern=/images/pbslemon-task.png').set({
						width: this.self(arguments).DEFAULT_WIDTH,
						height: this.self(arguments).DEFAULT_HEIGHT,
						contentPadding: 10,
						showStatusbar: true,
						status: 'PBS Lemon 0.1' + ' - ' + 'CECALCULA'
			});

			this._window.center();
			
			/* MAIN LAYOUT */
			var windowLayout = new qx.ui.layout.VBox();
			this._window.setLayout(windowLayout);

			/* TABVIEW */
			var tabView = new qx.ui.tabview.TabView().set({
				barPosition: 'top',
				contentPaddingTop: 10,
				contentPaddingBottom: 10,
				contentPaddingRight: 2,
				contentPaddingLeft: 10
			});

			this._window.add(tabView, {flex: 1});
			
			/* SUBMIT PAGE */
			var submitPage = new qx.ui.tabview.Page(tr('Job submission'), 
				'index.php?extern=/images/pbslemon/submit-icon.png');

			submitPage.setLayout(new qx.ui.layout.VBox());

			tabView.add(submitPage, {flex: 1});

			var submitContainer = new qx.ui.container.Composite();
			submitContainer.setLayout(new qx.ui.layout.VBox().set({ spacing: 20 }));

			var scrollerSubmit = new qx.ui.container.Scroll().set({
				contentPaddingRight: 10
			});
			
			submitPage.add(scrollerSubmit, {flex: 1});
			scrollerSubmit.add(submitContainer, {flex: 1});
			
			//Submit form
			
			//Basic options
	
			var groupPrincipals = new qx.ui.groupbox.GroupBox(tr('Basic options'));
			submitContainer.add(groupPrincipals);

			var principalsGrid = new qx.ui.layout.Grid();
			principalsGrid.setSpacingX(15);
			principalsGrid.setSpacingY(5);
			principalsGrid.setColumnAlign(0, 'left', 'middle');
			principalsGrid.setColumnAlign(1, 'left', 'middle');
			principalsGrid.setColumnFlex(1,1);
			groupPrincipals.setLayout(principalsGrid);
			
			var jobNameLabel = new qx.ui.basic.Label(tr('Job name'));
			groupPrincipals.add(jobNameLabel, {row: 0, column: 0});
			
			var jobNameTextField = new qx.ui.form.TextField();
			groupPrincipals.add(jobNameTextField, {row: 0, column: 1});

			var fileExecuteLabel = new qx.ui.basic.Label(tr('File to execute'));
			groupPrincipals.add(fileExecuteLabel, {row: 1, column: 0});

			var fileExecuteTextField = new qx.ui.form.TextField();
			groupPrincipals.add(fileExecuteTextField, {row: 1, column: 1});

			var executeFileChooser = new eyeos.dialogs.FileChooser(this._checknum);
			fileExecuteTextField.addListener('click', function(e) {
				executeFileChooser.showOpenDialog(this._window, function(choice, path) {
					if(choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
						fileExecuteTextField.setValue(path);
					}
				}, this, null);
			}, this);

			var outputFileLabel = new qx.ui.basic.Label(tr('Output file'));
			groupPrincipals.add(outputFileLabel, {row: 2, column: 0});

			var outputFileTextField = new qx.ui.form.TextField();
			groupPrincipals.add(outputFileTextField, {row: 2, column: 1});

			var outputFileChooser = new eyeos.dialogs.FileChooser(this._checknum);
			outputFileTextField.addListener('click', function(e) {
				outputFileChooser.showSaveDialog(this._window, function(choice, path) {
					if(choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
						outputFileTextField.setValue(path);
					}
				}, this, null, 'Output file');
			}, this);

			var errorFileLabel = new qx.ui.basic.Label(tr('Error file'));
			groupPrincipals.add(errorFileLabel, {row: 3, column: 0});

			var errorFileTextField = new qx.ui.form.TextField();
			groupPrincipals.add(errorFileTextField, {row: 3, column: 1});

			var errorFileChooser = new eyeos.dialogs.FileChooser(this._checknum);
			errorFileTextField.addListener('click', function(e) {
				errorFileChooser.showSaveDialog(this._window, function(choice, path) {
					if(choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
						errorFileTextField.setValue(path);
					}
				}, this, null, 'Error file');
			}, this);

			//Advanced options

			var groupAdvanced = new qx.ui.groupbox.GroupBox(tr('Advanced options'));
			submitContainer.add(groupAdvanced);

			var advancedGrid = new qx.ui.layout.Grid();
			advancedGrid.setSpacingX(15);
			advancedGrid.setSpacingY(5);

			for (var i = 0; i <= 5; i++) {
				advancedGrid.setColumnAlign(i, 'left', 'middle');
			}

			groupAdvanced.setLayout(advancedGrid);

			var ncpusLabel = new qx.ui.basic.Label(tr('#CPUs'));
			groupAdvanced.add(ncpusLabel, {row: 0, column: 0});

			var ncpusTextField = new qx.ui.form.TextField();
			groupAdvanced.add(ncpusTextField, {row: 0, column: 1});

			var memLabel = new qx.ui.basic.Label(tr('Memory amount'));
			groupAdvanced.add(memLabel, {row: 0, column: 2});

			var memTextField = new qx.ui.form.TextField();
			groupAdvanced.add(memTextField, {row: 0, column: 3});

			var walltimeLabel = new qx.ui.basic.Label(tr('Walltime'));
			groupAdvanced.add(walltimeLabel, {row: 0, column: 4});

			var walltimeTextField = new qx.ui.form.TextField();
			groupAdvanced.add(walltimeTextField, {row: 0, column: 5});

			var queueLabel = new qx.ui.basic.Label(tr('Queue'));
			groupAdvanced.add(queueLabel, {row: 1, column: 0});

			var queueComboBox = new qx.ui.form.ComboBox();
			
			eyeos.callMessage(this.getChecknum(), 'queueList', null, function(queueData) {
				var queueList = new Array();
				queueList = queueData;
				for (var i = 0; i < queueList.length; i++) {
					var item = new qx.ui.form.ListItem(queueList[i]);
					queueComboBox.add(item);
				}
			}, this);
			
			groupAdvanced.add(queueComboBox, {row: 1, column: 1});

			var priorityLabel = new qx.ui.basic.Label(tr('Job priority')); 
			groupAdvanced.add(priorityLabel, {row: 1, column: 2});

			var prioritySpinner = new qx.ui.form.Spinner(-1024, 0, 1024);
			groupAdvanced.add(prioritySpinner, {row: 1, column: 3});

			var rerunableLabel = new qx.ui.basic.Label(tr('Rerunable'));
			groupAdvanced.add(rerunableLabel, {row: 1, column: 4});

			var rerunableCheckBox = new qx.ui.form.CheckBox();
			groupAdvanced.add(rerunableCheckBox, {row: 1, column: 5});

			var nodesLabel = new qx.ui.basic.Label(tr('#Nodes'));
			groupAdvanced.add(nodesLabel, {row: 2, column: 0});

			var nodesTextField = new qx.ui.form.TextField();
			groupAdvanced.add(nodesTextField, {row: 2, column: 1});

			var ppnLabel = new qx.ui.basic.Label(tr('Processes per node'));
			groupAdvanced.add(ppnLabel, {row: 2, column: 2});

			var ppnTextField = new qx.ui.form.TextField();
			groupAdvanced.add(ppnTextField, {row: 2, column: 3});


			//EXECUTION COMMANDS

			var groupExecutionCommands = new qx.ui.groupbox.GroupBox(tr(
				'Execution command'));
			
			var executionGrid = new qx.ui.layout.Grid()
			executionGrid.setSpacingX(15);
			executionGrid.setSpacingY(5);

			for(var i = 0; i < 3; i++) {
				executionGrid.setColumnAlign(i, 'left', 'middle');
			}
			executionGrid.setColumnFlex(2,1);
			groupExecutionCommands.setLayout(executionGrid);

			var executionCommandComboBox = new qx.ui.form.ComboBox();

			var oneNodeItem = new qx.ui.form.ListItem('Normal execution (One node)');
			var mpirunItem = new qx.ui.form.ListItem('MPIRUN');
			executionCommandComboBox.add(oneNodeItem);
			executionCommandComboBox.add(mpirunItem);
			
			groupExecutionCommands.add(executionCommandComboBox, {row: 0, column: 0});

			var parametersLabel = new qx.ui.basic.Label(tr('Addtional parameters'));
			groupExecutionCommands.add(parametersLabel, {row: 0, column: 1});

			var parametersTextField = new qx.ui.form.TextField();
			groupExecutionCommands.add(parametersTextField, {row: 0, column: 2});


			//ADDITIONAL COMMANDS BEFORE
			
			var groupAdditionalBefore = new qx.ui.groupbox.GroupBox(tr(
				'Additional commands before job execution'));
			submitContainer.add(groupAdditionalBefore);
			
			groupAdditionalBefore.setLayout(new qx.ui.layout.VBox());

			var commandsBeforeTextArea = new qx.ui.form.TextArea();
			groupAdditionalBefore.add(commandsBeforeTextArea);

			//ADDITIONAL COMMANDS AFTER
	       	
			var groupAdditionalAfter = new qx.ui.groupbox.GroupBox(tr(
				'Additional commands after job execution'));
			submitContainer.add(groupAdditionalAfter);
			
			groupAdditionalAfter.setLayout(new qx.ui.layout.VBox());
			
			var commandsAfterTextArea = new qx.ui.form.TextArea();
			groupAdditionalAfter.add(commandsAfterTextArea);

			//SUBMIT BUTTON
			var submitButton = new qx.ui.form.Button(tr('Submit')).set({
				height: 30,
				maxWidth: 100
			});
			submitContainer.add(submitButton);

			submitButton.addListener('execute', function(e) {
				var submitParams = new Array();

				submitParams.push(jobNameTextField.getValue());
				submitParams.push(fileExecuteTextField.getValue());
				submitParams.push(outputFileTextField.getValue());
				submitParams.push(errorFileTextField.getValue());
				submitParams.push(ncpusTextField.getValue());
				submitParams.push(memTextField.getValue());
				submitParams.push(walltimeTextField.getValue());
				submitParams.push(queueComboBox.getValue());
				submitParams.push(prioritySpinner.getValue());
				submitParams.push(rerunableCheckBox.getValue());
				submitParams.push(nodesTextField.getValue());
				submitParams.push(ppnTextField.getValue());
				submitParams.push(executionCommandComboBox.getValue());
				submitParams.push(parametersTextField.getValue());
				submitParams.push(commandsBeforeTextArea.getValue());
				submitParams.push(commandsAfterTextArea.getValue());
			}, this);

			/* STATUS PAGES */
			var statusPage = new qx.ui.tabview.Page(tr('Job status'),
				'index.php?extern=/images/pbslemon/status-icon.png');
			statusPage.setLayout(new qx.ui.layout.VBox().set({ spacing: 5 }));
			tabView.add(statusPage, {flex: 1});

			var statusContainer = new qx.ui.container.Composite();
			statusContainer.setLayout(new qx.ui.layout.VBox());

			var toolbarContainer = new qx.ui.container.Composite();
			toolbarContainer.setLayout(new qx.ui.layout.VBox());
			
			statusPage.add(toolbarContainer);
			statusPage.add(statusContainer, {flex: 1});

			//TOOLBAR
			var toolbar = new qx.ui.toolbar.ToolBar();
			toolbarContainer.add(toolbar);

			var refreshButton = new qx.ui.toolbar.Button(tr('Refresh'),
				'index.php?extern=/images/pbslemon/refresh-icon.png').set({
					iconPosition: 'left'
				});

			refreshButton.addListener('execute', this._refreshJobTable, this);

			toolbar.add(refreshButton);

			var stopButton = new qx.ui.toolbar.Button(tr('Stop'),
				'index.php?extern=/images/pbslemon/stop-icon.png').set({
					iconPosition: 'left'
				});
			toolbar.add(stopButton);


			//JOB TABLE
			
			var jobTableModel = new qx.ui.table.model.Simple();
			jobTableModel.setColumns([
				tr('ID'), 
				tr('Name'), 
				tr('Status'), 
				tr('Queue'),
				tr('Start time'),
				tr('Finish time')
			]);
			
			for (var i = 0; i < 6; i++) {
				jobTableModel.setColumnSortable(i, true);
			}

			this._jobTable = new qx.ui.table.Table(jobTableModel).set({
				statusBarVisible: false
			});

			statusContainer.add(this._jobTable, {flex: 1});


			/* ABOUT PAGE */
			var aboutPage = new qx.ui.tabview.Page(tr('About'),
				'index.php?extern=/images/pbslemon/info-icon.png');
			aboutPage.setLayout(new qx.ui.layout.VBox());
			tabView.add(aboutPage);
		},

		_refreshJobTable: function() {
			this._jobTable.getTableModel().removeRows(0, this._jobTable.getTableModel().getRowCount());

			eyeos.callMessage(this._checknum, 'jobStatus', null, function(jobData) {
				this._jobTable.getTableModel().setData(jobData);
			}, this);
		},

		open: function() {
			this._window.open();
		}
	}
});
