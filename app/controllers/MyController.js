module.exports = Spine.Controller.sub({
	el : 'body',
	events:{
		'tap .ui-icon-addEntryAIR':'addNewAIRForm',
		'tap airView' : 'addNewAIRForm',
		'tap #sicknessFormDashboard.air-grid .grid-body' : 'generateAIRErrors',
		'change #occured':'addExcursionMandatory',
		'tap #air-submitPart1' : 'submitAIRPart1',
		'tap #air-submitPart2' : 'submitAIRPart2',
		
	},
	sendFailedAIRForms : function() {
		if(tuiForms.currentCount < tuiForms.selectedAIRForms.length) {
			$('.loading-msg').html("Sending " + (tuiForms.currentCount + 1) + " of " + (tuiForms.selectedAIRForms.length));
			var form_id = tuiForms.selectedAIRForms[tuiForms.currentCount].id;
			var status = tuiForms.selectedAIRForms[tuiForms.currentCount].status;
			var data = tuiForms.models.AIRModel.findByAttribute("id", form_id);
			if(status == "part1") {
				var form_report = tuiForms.util.generateAIRReport({data : data});
				tuiForms.util.sendMail({
					from : tuiForms.fromEmail,
					to : data.customerSignature,
					subject : "AIR Form Report",
					body : form_report,
					attachment : "",
					successCB : tuiForms.airController.airFormSuccess,
					errorCB : tuiForms.airController.airFormError
				});
			}
			if(status == "part2") {
				var form_report = tuiForms.util.generateAIRReport2({data : data});
				tuiForms.mailToRTM = '';
			
			try{
			if(data.rtmMailId == "other") {
				tuiForms.mailToRTM = data.rtmMailIdOther;
			} else {
				tuiForms.mailToRTM = data.rtmMailId;
			}
			}
			catch(e){
				tuiForms.showAlert(e);
			}
				tuiForms.util.sendMail({
					from : tuiForms.fromEmail,
					bccEmail : [tuiForms.userEmailID, data.contactEmail, tuiForms.mailToRTM, tuiForms.cyprusEmail].join(","),
					attachment : data.attachmentUrl || "",
					subject : "AIR Form Report",
					body : form_report,
					successCB : tuiForms.airController.airFormSuccess,
					errorCB : tuiForms.airController.airFormError
				});					
			}
		} else {
			$('body').loadingMask('hide');
			tuiForms.showAlert("Forms successfully submitted");
			tuiForms.util.refreshAll();
		}
	}, 
	airFormSuccess : function() {
		var form_id = tuiForms.selectedAIRForms[tuiForms.currentCount].id;
		var status = tuiForms.selectedAIRForms[tuiForms.currentCount].status;
		var data = tuiForms.models.AIRModel.findByAttribute("id", form_id);
		if(status == "part1") {
			data.part1Status = "submit"
			data.save();
			tuiForms.util.updateFormData({
				id : data.id,
				dataPart1 : JSON.stringify(data),
				validation : "",
				report1 : tuiForms.util.generateAIRReport({data : data}),
				status : "submit",
				attachment : data.attachmentUrl,
				editMode : "NO"
			});
			if(data.part2Status == "submit") {
				data.destroy();
				tuiForms.util.deleteFormData(data.id);
			}
		}
		if(status == "part2") {
			data.part2Status = "submit"
			data.save();
			tuiForms.util.updateFormData({
				id : data.id,
				dataPart1 : JSON.stringify(data),
				validation : "",
				report1 : tuiForms.util.generateAIRReport({data : data}),
				report2 : tuiForms.util.generateAIRReport2({data : data}),
				status : data.part1Status,
				status2 : "submit",
				attachment : data.attachmentUrl,
				editMode : "NO"
			});
			if(data.part1Status == "submit") {
				data.destroy();
				tuiForms.util.deleteFormData(data.id);
			}
		}
		tuiForms.currentCount++;
		tuiForms.airController.sendFailedAIRForms();
	}, 
	airFormError : function(errorMsg) {
		$('body').loadingMask('hide');
		tuiForms.showAlert(errorMsg);
		if(errorMsg.indexOf("Failed while sending email") != -1) {
			var form_id = tuiForms.selectedAIRForms[tuiForms.currentCount].id;
			var status = tuiForms.selectedAIRForms[tuiForms.currentCount].status;
			var data = tuiForms.models.AIRModel.findByAttribute("id", form_id);
			if(status == "part1") {
				data.part1Status = "saved"
				data.save();
				tuiForms.util.updateFormData({
					id : data.id,
					dataPart1 : JSON.stringify(data),
					validation : "",
					report1 : tuiForms.util.generateAIRReport({data : data}),
					status : "saved",
					attachment : data.attachmentUrl,
					editMode : "NO"
				});
			}
			if(status == "part2") {
				data.part2Status = "saved"
				data.save();
				tuiForms.util.updateFormData({
					id : data.id,
					dataPart1 : JSON.stringify(data),
					validation : "",
					report1 : tuiForms.util.generateAIRReport({data : data}),
					report2 : tuiForms.util.generateAIRReport2({data : data}),
					status : data.part1Status,
					status2 : "saved",
					attachment : data.attachmentUrl,
					editMode : "NO"
				});
			}
		}
		tuiForms.util.refreshAll();
	},
	addExcursionMandatory : function(){
		var options = tuiForms.currentFormOptions;
		var currentStep = options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]];
		var currentMandatoryFields = options.form_metadata.mandatoryFields[currentStep];
		if($('#occured').is(':checked')){
			document.getElementById('nameExcursion').disabled=false;
			currentMandatoryFields.push('nameExcursion');	
			$('#excursionName').append('<span>*</span>');
		}
		else
		{
			document.getElementById('nameExcursion').disabled=true;
			$('#nameExcursion').val('');
			currentMandatoryFields.pop('nameExcursion');
			if($('#nameExcursion').hasClass('mandatory-error-field')){
				$('#nameExcursion').removeClass('mandatory-error-field');
			}
			$("#excursionName span").remove();
		}
	},
	deleteCallback : function(button) {
		if(button == 1) {
			tuiForms.savedFormCount = '';
			if(tuiForms.deleted_data.attachmentUrl){
				ImageAttachment.remove(function(){
				
			},function(){
				
			},
			{
				url:tuiForms.deleted_data.attachmentUrl
			});
			}
						
			tuiForms.util.deleteFormData(tuiForms.deleted_data.id);
			$('#sicknessFormDashboard').grid('remove', tuiForms.deleted_data);
			$('#sicknessFormDashboard').grid('refresh');
			tuiForms.deleted_data.destroy();
			$('#sicknessFormDashboard').grid('refresh', tuiForms.models.AIRModel.all());	
			tuiForms.util.refreshAll();
			tuiForms.util.refreshPodGrid();	
		}
	},
	generateAIRErrors : function(event){
		
		tuiForms.savedAIRFormCount = '';
		tuiForms.deleted_data = '';
		if(event.target.getAttribute('type') == "checkbox") {
			tuiForms.checked_data = $.view(event.target).data;
			if($('#sicknessFormDashboard').find('input:checked').length == 0) {
 				tuiForms.selectedAIRForms = [];
 				$('#sendForms').addClass('send_disabled');

			}
			if($(event.target).prop("checked")==false){
				tuiForms.selectedAIRForms.push({
					id : tuiForms.checked_data.id,
					status : $(event.target).attr("rel")
				});
				$('#sendForms').removeClass('send_disabled');

			}
			else{
				var index=-1;
				for(var i=0;i < tuiForms.selectedAIRForms.length;i++){
					if(tuiForms.selectedAIRForms[i].id==tuiForms.checked_data.id){
						index= i;
					}
				}
				if(index > -1){
					tuiForms.selectedAIRForms.splice(index,1)
				}
				if(tuiForms.selectedAIRForms.length==0){
					$('#sendForms').addClass('send_disabled');
				}
			}

			return;
		}
		// if($(event.target).hasClass("grid-label")) {
			// return;
		// }
		// if($(event.target).hasClass("no-access")) {
			// return;
		// }
		if($(event.target).hasClass("ui-icon-delete-grid")) {
			tuiForms.deleted_data = $.view(event.target).data;
			tuiForms.showConfirm('Are you sure,you want to delete this data ?', tuiForms.airController.deleteCallback);		
		} 
		else 
		{
			var selected_data = $.view(event.target).data;
			if(selected_data) {
				tuiForms.util.updateEditMode(selected_data.id, "YES");	
				// if(!tuiForms.views.airView) {
					// tuiForms.views.airView = new Spine.View(
					// {
						// template : 'templates/airTemplate.html',
						// hideAnimation : 'slideout',
						// showAnimation : 'slidein'
					// });
				// tuiForms.views.airView.render('#viewport');			
				// tuiForms.util.initializeClickover();		
				// } 
				// else {
				// $.navigatePage(tuiForms.views.airView);
				// }
				$('#tg').html("");
				$('#airTempl').html("");
				$('#csfTempl').html("");
				if(!tuiForms.views.airView) {
						tuiForms.views.airView = new Spine.View(
						{
							template : 'templates/airTemplate.html',
							hideAnimation : 'slideout',
							showAnimation : 'slidein'
						});
					tuiForms.views.airView.render('#viewport');			
					tuiForms.util.initializeClickover();		
				}
				this.airStepForm('air', selected_data, 'airTempl'); 
				if(tuiForms.views.airView) {
					$.navigatePage(tuiForms.views.airView);
				}
				$('.aif').addClass('aif-active');
				if($('.sif').hasClass('sif-active')){
					$('.sif').removeClass('sif-active');
				}
				if($('.csf').hasClass('csf-active')){
					$('.csf').removeClass('csf-active');
				}
				this.initializeMobiScroll();
				if($('#rtmMail').val()=='other'){
						$('#rtmEmailId').attr('readonly',false);
							document.getElementById('rtmEmailId').disabled=false;
				}
				if(selected_data.accommodationName=='other'){
						$('#accom_name_other').attr('readonly',false);
						$('#accom_name_other').attr('disabled',false);
				}
				$('#customerDOB').attr('readonly',false);
				$('#arrivalDate').attr('readonly',false);
				$('#departureDate').attr('readonly',false);
				$('#dateTookPlace').attr('readonly',false);
				$('#timeTookPlace').attr('readonly',false);
				$('#inspectedDate').attr('readonly',false);
				$('#inspectedTime').attr('readonly',false);
				$('#supplierDate').attr('readonly',false);
				if(selected_data.attachmentUrl){
				$('#attachText').val(selected_data.id+".jpeg");
				}else{
					$('#removeFile').hide();
				}
				if(selected_data.part1Status=="submit" || selected_data.part1Status=="failed"){
					$('#airCustomerTab').append('<div id="sicknessGridHolder-mask" class="grid-mask"></div>');
				}
				if(selected_data.part2Status=="submit" || selected_data.part2Status=="failed"){
					$('#airOfficeTab').append('<div id="sicknessGridHolder-mask" class="grid-mask"></div>');
				}
				if($('#occured').is(':checked')){
					document.getElementById('nameExcursion').disabled=false;
					currentMandatoryFields.push('nameExcursion');	
					$('#excursionName').append('<span>*</span>');
				}
				else
				{
					document.getElementById('nameExcursion').disabled=true;
					$('#nameExcursion').val('');
					currentMandatoryFields.pop('nameExcursion');
					if($('#nameExcursion').hasClass('mandatory-error-field')){
						$('#nameExcursion').removeClass('mandatory-error-field');
					}
					$("#excursionName span").remove();
				}
			}
		}
	},
	initializeMobiScroll : function(){
	var todaysDate = new Date();
		todaysDate.setHours(0, 0, 0, 0);
			$("#customerDOB").mobiscroll().date({
			theme : 'ios',
			mode : 'scroller',
			display : 'bubble',
			dateFormat : 'dd/mm/yyyy',
			dateOrder : 'ddmmyyyy',
			setText : 'Done',
			onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},			
			onSelect:function(inst){
			var newDate= inst.split('/');
			var pickedDate = new Date(newDate[2],(newDate[1]-1),newDate[0],0,0,0,0);
			if(pickedDate < todaysDate) {
				tuiForms.validations.customerDOB.typeError = false;
				tuiForms.validations.customerDOB.errorMessage = '';
				$("#customerDOB").attr('data-original-title', '');
				$("#customerDOB").tooltip('hide');
				$("#customerDOB").removeClass('errorField');
			} else {
				tuiForms.validations.customerDOB.typeError = true;
				tuiForms.validations.customerDOB.errorMessage = 'Please enter a date less than todays date';
				$("#customerDOB").addClass('errorField');
				$("#customerDOB").attr('data-original-title', tuiForms.validations.customerDOB.errorMessage);
				$("#customerDOB").tooltip('show');
				setTimeout(function() {
					$("#customerDOB").tooltip('hide')
				}, 2000);
			}
			$("#customerDOB").removeClass('mandatory-error-field');
			}
		});
			$("#arrivalDate").mobiscroll().date({
			theme : 'ios',
			display : 'bubble',
			mode : 'scroller',
			dateFormat : 'dd/mm/yyyy',
			dateOrder : 'ddmmyyyy',
			endyear : (new Date()).getFullYear(),
			setText : 'Done',
			onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},			
			onSelect : function(inst) {
				tuiForms.validations.departureDate={};
				var newDate= inst.split('/');
				var pickedDate = new Date(newDate[2],(newDate[1]-1),newDate[0],0,0,0,0);
				if(pickedDate <= todaysDate) {
					tuiForms.validations.arrivalDate.typeError = false;
					tuiForms.validations.arrivalDate.errorMessage = '';
					$("#arrivalDate").attr('data-original-title', '');
					$("#arrivalDate").tooltip('hide');
					$("#arrivalDate").removeClass('errorField');
					if($('#departureDate').hasClass('errorField')) {
						$('#departureDate').attr('data-original-title', '');
						$('#departureDate').tooltip('hide');
						$('#departureDate').removeClass('errorField');
					}
				} else {
					tuiForms.validations.arrivalDate.typeError = true;
					tuiForms.validations.arrivalDate.errorMessage = 'Please enter a date less than todays date';
					$("#arrivalDate").addClass('errorField');
					$("#arrivalDate").attr('data-original-title', tuiForms.validations.arrivalDate.errorMessage);
					$("#arrivalDate").tooltip('show');
					setTimeout(function() {
						$("#arrivalDate").tooltip('hide')
					}, 2000);
				}
				if($('#departureDate').val() != '') {
					var newdep_date= $('#departureDate').val().split('/');
					var dep_date = new Date(newdep_date[2],(newdep_date[1]-1),newdep_date[0],0,0,0,0);
					if(pickedDate < dep_date) {
						tuiForms.validations.arrivalDate.typeError = false;
						tuiForms.validations.arrivalDate.errorMessage = '';
						$("#arrivalDate").attr('data-original-title', '');
						$("#arrivalDate").tooltip('hide');
					} else {
						tuiForms.validations.departureDate.typeError = true;
						tuiForms.validations.departureDate.errorMessage = 'Departure date should be greater than arrival date';
						console.log(tuiForms.validations);
						$("#departureDate").addClass('errorField');
						$("#departureDate").attr('data-original-title', tuiForms.validations.dep_date.errorMessage);
						$("#departureDate").tooltip('show');
						setTimeout(function() {
							$("#departureDate").tooltip('hide')
						}, 1000);
					}
				}
				$("#arrivalDate").removeClass('mandatory-error-field');

			}
		});
		$("#departureDate").mobiscroll().date({
			theme : 'ios',
			display : 'bubble',
			mode : 'scroller',
			dateFormat : 'dd/mm/yyyy',
			dateOrder : 'ddmmyyyy',
			endyear : (new Date()).getFullYear(),
			setText : 'Done',
			onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},			
			onSelect : function(inst) {
				
				if($('#arrivalDate').val() != '') {
					var newDate= inst.split('/');
					var dep_date = new Date(newDate[2],(newDate[1]-1),newDate[0],0,0,0,0);
					var newarr_date= $('#arrivalDate').val().split('/');
					var arr_date = new Date(newarr_date[2],(newarr_date[1]-1),newarr_date[0],0,0,0,0);
					if(dep_date > arr_date) {
						tuiForms.validations.departureDate.typeError = false;
						tuiForms.validations.departureDate.errorMessage = '';
						$("#departureDate").attr('data-original-title', '');
						$("#departureDate").tooltip('hide');
						$("#departureDate").removeClass('errorField');
					} else {
						tuiForms.validations.departureDate.typeError = true;
						tuiForms.validations.departureDate.errorMessage = 'Departure date should be greater than arrival date';
						console.log(tuiForms.validations);
						$("#departureDate").addClass('errorField');
						$("#departureDate").attr('data-original-title', tuiForms.validations.departureDate.errorMessage);
						$("#departureDate").tooltip('show');
						setTimeout(function() {
							$("#departureDate").tooltip('hide')
						}, 1000);
					}
				} else {
					tuiForms.validations.departureDate.typeError = true;
					tuiForms.validations.departureDate.errorMessage = 'Please enter arrival date before entering departure date';
					$("#departureDate").addClass('errorField');
					$("#departureDate").val('');
					$("#departureDate").attr('data-original-title', tuiForms.validations.departureDate.errorMessage);
					$("#departureDate").tooltip('show');
					setTimeout(function() {
						$("#departureDate").tooltip('hide')
					}, 2000);
				}
				$("#departureDate").removeClass('mandatory-error-field');
			}
		});//dateTookPlace
			$("#dateTookPlace").mobiscroll().date({
			theme : 'ios',
			display : 'bubble',
			mode : 'scroller',
			dateFormat : 'dd/mm/yyyy',
			dateOrder : 'ddmmyyyy',
			endyear : (new Date()).getFullYear(),
			setText : 'Done',
			onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},			
			onSelect : function(inst) {
				var newDate= inst.split('/');
					var incident_date = new Date(newDate[2],(newDate[1]-1),newDate[0],0,0,0,0);
					var newarr_date= $('#arrivalDate').val().split('/');
					var arr_date = new Date(newarr_date[2],(newarr_date[1]-1),newarr_date[0],0,0,0,0);
				if($('#arrivalDate').val() != '') {
					if((incident_date >= arr_date)&&(incident_date <= todaysDate)) {
						tuiForms.validations.dateTookPlace.typeError = false;
						tuiForms.validations.dateTookPlace.errorMessage = '';
						$("#dateTookPlace").attr('data-original-title', '');
						$("#dateTookPlace").tooltip('hide');
						$("#dateTookPlace").removeClass('errorField');
					} else if(incident_date < arr_date) {
						tuiForms.validations.dateTookPlace.typeError = true;
						tuiForms.validations.dateTookPlace.errorMessage = 'Incident date should be greater than arrival date';
						//console.log(tuiForms.validations);
						$("#dateTookPlace").addClass('errorField');
						$("#dateTookPlace").attr('data-original-title', tuiForms.validations.dateTookPlace.errorMessage);
						$("#dateTookPlace").tooltip('show');
						setTimeout(function() {
							$("#dateTookPlace").tooltip('hide')
						}, 1000);
					}
					else if(incident_date > todaysDate){
							tuiForms.validations.dateTookPlace.typeError = true;
					tuiForms.validations.dateTookPlace.errorMessage = 'Please enter a date less than todays date';
					$("#dateTookPlace").addClass('errorField');
					$("#dateTookPlace").attr('data-original-title', tuiForms.validations.dateTookPlace.errorMessage);
					$("#dateTookPlace").tooltip('show');
					setTimeout(function() {
						$("#dateTookPlace").tooltip('hide')
					}, 2000);
					}
				} else {
					tuiForms.validations.dateTookPlace.typeError = true;
					tuiForms.validations.dateTookPlace.errorMessage = 'Please enter arrival date before entering departure date';
					$("#dateTookPlace").addClass('errorField');
					$("#dateTookPlace").val('');
					$("#dateTookPlace").attr('data-original-title', tuiForms.validations.dateTookPlace.errorMessage);
					$("#dateTookPlace").tooltip('show');
					setTimeout(function() {
						$("#dateTookPlace").tooltip('hide')
					}, 2000);
				}
				$("#dateTookPlace").removeClass('mandatory-error-field');
			}
		});//dateTookPlace
		var now = new Date(); 
		var dateString = now.getDate() + "/" +(now.getMonth()+1) + "/" + now.getFullYear();
		$("#cusDate").val(dateString);
		$('#timeTookPlace').mobiscroll().time({
			theme : 'ios',
			display : 'bubble',
			mode : 'scroller',
			setText : 'Done',
			onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},			
			onSelect:function(inst){
				$("#timeTookPlace").removeClass('mandatory-error-field');
			}
		});
		$("#inspectedDate").mobiscroll().date({
			theme : 'ios',
			display : 'bubble',
			mode : 'scroller',
			dateFormat : 'dd/mm/yyyy',
			dateOrder : 'ddmmyyyy',
			endyear : (new Date()).getFullYear(),
			setText : 'Done',
			onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},			
			onSelect : function(inst) {
				var newDate= inst.split('/');
				var inspected_date = new Date(newDate[2],(newDate[1]-1),newDate[0],0,0,0,0);
			if($('#dateTookPlace').val() != '') {
					var newdateTookPlace= $('#dateTookPlace').val().split('/');
					var dateTookPlace = new Date(newdateTookPlace[2],(newdateTookPlace[1]-1),newdateTookPlace[0],0,0,0,0);			
					if((inspected_date >= dateTookPlace)&&(inspected_date <= todaysDate)) {
						tuiForms.validations.inspectedDate.typeError = false;
						tuiForms.validations.inspectedDate.errorMessage = '';
						$("#inspectedDate").attr('data-original-title', '');
						$("#inspectedDate").tooltip('hide');
						$("#inspectedDate").removeClass('errorField');
					} else if(inspected_date < dateTookPlace) {
						tuiForms.validations.inspectedDate.typeError = true;
						tuiForms.validations.inspectedDate.errorMessage = 'Inspected date should be greater than incident date';
						//console.log(tuiForms.validations);
						$("#inspectedDate").addClass('errorField');
						$("#inspectedDate").attr('data-original-title', tuiForms.validations.inspectedDate.errorMessage);
						$("#inspectedDate").tooltip('show');
						setTimeout(function() {
							$("#inspectedDate").tooltip('hide')
						}, 1000);
					}
					else if(inspected_date > todaysDate){
							tuiForms.validations.inspectedDate.typeError = true;
					tuiForms.validations.inspectedDate.errorMessage = 'Please enter a date less than todays date';
					$("#inspectedDate").addClass('errorField');
					$("#inspectedDate").attr('data-original-title', tuiForms.validations.inspectedDate.errorMessage);
					$("#inspectedDate").tooltip('show');
					setTimeout(function() {
						$("#inspectedDate").tooltip('hide')
					}, 2000);
					}
				} else {
					tuiForms.validations.inspectedDate.typeError = true;
					tuiForms.validations.inspectedDate.errorMessage = 'Please enter incident date before entering inspection date';
					$("#inspectedDate").addClass('errorField');
					$("#inspectedDate").val('');
					$("#inspectedDate").attr('data-original-title', tuiForms.validations.inspectedDate.errorMessage);
					$("#inspectedDate").tooltip('show');
					setTimeout(function() {
						$("#inspectedDate").tooltip('hide')
					}, 2000);
				}
				$("#inspectedDate").removeClass('mandatory-error-field');
			}
		});
$('#inspectedTime').mobiscroll().time({
			theme : 'ios',
			display : 'bubble',
			mode : 'scroller',
			setText : 'Done',
			onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},			
			onSelect:function(inst){
				$("#inspectedTime").removeClass('mandatory-error-field');
			}
		});//supplierDate
		$("#supplierDate").mobiscroll().date({
			theme : 'ios',
			display : 'bubble',
			mode : 'scroller',
			dateFormat : 'dd/mm/yyyy',
			dateOrder : 'ddmmyyyy',
			endyear : (new Date()).getFullYear(),
			setText : 'Done',
				onBeforeShow : function(){
				tuiForms.mobiscrollOpen = true;
			},
			onClose : function(){
				tuiForms.mobiscrollOpen = false;
			},		
			onSelect : function(inst) {
				var newDate= inst.split('/');
				var supplierDate = new Date(newDate[2],(newDate[1]-1),newDate[0],0,0,0,0);		
				if($('#dateTookPlace').val() != '') {
					var newdateTookPlace= $('#dateTookPlace').val().split('/');
					var dateTookPlace = new Date(newdateTookPlace[2],(newdateTookPlace[1]-1),newdateTookPlace[0],0,0,0,0);				
					if((supplierDate >= dateTookPlace)&&(supplierDate <= todaysDate)) {
						tuiForms.validations.supplierDate.typeError = false;
						tuiForms.validations.supplierDate.errorMessage = '';
						$("#supplierDate").attr('data-original-title', '');
						$("#supplierDate").tooltip('hide');
						$("#supplierDate").removeClass('errorField');
					} else if(supplierDate < dateTookPlace) {
						tuiForms.validations.supplierDate.typeError = true;
						tuiForms.validations.supplierDate.errorMessage = 'Supplier date should be greater than incident date';
						//console.log(tuiForms.validations);
						$("#supplierDate").addClass('errorField');
						$("#supplierDate").attr('data-original-title', tuiForms.validations.supplierDate.errorMessage);
						$("#supplierDate").tooltip('show');
						setTimeout(function() {
							$("#supplierDate").tooltip('hide')
						}, 1000);
					}
					else if(supplierDate > todaysDate){
							tuiForms.validations.supplierDate.typeError = true;
					tuiForms.validations.supplierDate.errorMessage = 'Please enter a date less than todays date';
					$("#supplierDate").addClass('errorField');
					$("#supplierDate").attr('data-original-title', tuiForms.validations.supplierDate.errorMessage);
					$("#supplierDate").tooltip('show');
					setTimeout(function() {
						$("#supplierDate").tooltip('hide')
					}, 2000);
					}
				} else {
					tuiForms.validations.supplierDate.typeError = true;
					tuiForms.validations.supplierDate.errorMessage = 'Please enter incident date before entering supplier date';
					$("#supplierDate").addClass('errorField');
					$("#supplierDate").val('');
					$("#supplierDate").attr('data-original-title', tuiForms.validations.supplierDate.errorMessage);
					$("#supplierDate").tooltip('show');
					setTimeout(function() {
						$("#supplierDate").tooltip('hide')
					}, 2000);
				}
				$("#supplierDate").removeClass('mandatory-error-field');
			}
		});
	},
	addNewAIRForm : function(){
		
	
		alert('rrr');
		
		
		if(!tuiForms.views.airView) {
			tuiForms.views.airView = new Spine.View({
				template : 'templates/airTemplate.html',
				hideAnimation : 'slideout',
				showAnimation : 'slidein',
			});
			tuiForms.views.airView.render('#viewport');
		}
		this.airStepForm('air', dummy, 'airTempl');
		if(tuiForms.views.airView) {
			$.navigatePage(tuiForms.views.airView);
		}
		tuiForms.util.initializeClickover();	
		
		
		$('.aif').addClass('aif-active');
		if($('.csf').hasClass('csf-active')){
			$('.csf').removeClass('csf-active');
		}
		if($('.sif').hasClass('sif-active')){
			$('.sif').removeClass('sif-active');
		}
		this.initializeMobiScroll();
		$('#customerDOB').attr('readonly',false);
			$('#arrivalDate').attr('readonly',false);
			$('#departureDate').attr('readonly',false);
			$('#dateTookPlace').attr('readonly',false);
			$('#timeTookPlace').attr('readonly',false);
			$('#inspectedDate').attr('readonly',false);
			$('#inspectedTime').attr('readonly',false);
			$('#supplierDate').attr('readonly',false);
	},
	showAirDashboard : function() {
		tuiForms.airForms = tuiForms.models.AIRModel.all();
		if($('#sicknessFormDashboard').hasClass('csf-grid')){
		
			$('#sicknessFormDashboard').removeClass('csf-grid');
			$('#sicknessFormDashboard').addClass('air-grid');
		}else if($('#sicknessFormDashboard').hasClass('sir-grid')){

			$('#sicknessFormDashboard').removeClass('sir-grid');
			$('#sicknessFormDashboard').addClass('air-grid');
		}
			if($('.send-mail').hasClass('green-btn')){
			$('.send-mail').removeClass('green-btn');
			$('.send-mail').addClass('pink-btn');
		}
		else if($('.send-mail').hasClass('blue-btn')){
			$('.send-mail').removeClass('blue-btn');
			$('.send-mail').addClass('pink-btn');
		}	
		$('#sicknessFormDashboard').grid('create', {
			headerTmpl : '<div class="flex-5">Name</div><div class="flex-5">Date Of Birth</div><div class="flex-5">Overseas Airport</div><div class="flex-5">Booking Reference</div><div class="flex-5">Room Number</div><div class="flex-5" style="text-align:center;">Part 1 Status</div><div class="flex-5" style="text-align:center;">Part 2 Status</div><div class="flex-1"></div>',
			rowTmpl : ['<div class="flex-5">{{:surName}}</div><div class="flex-5">{{:customerDOB}}</div><div class="flex-5">{{:overseasAirpot}}</div><div class="flex-5">{{:bookingReference}}</div><div class="flex-5">{{:roomNumber}}</div>',//
					   	'<div class="flex-5 no-access" style="text-align:center;">{{if part1Status=="failed"}}<input type="checkbox" rel="part1" class="grid-checkbox"/><div class="grid-label">Failed</div>{{else part1Status=="submit"}}Submitted{{else part1Status=="saved"}}Saved{{/if}}</div>',//
						'<div class="flex-5 no-access" style="text-align:center;">{{if part2Status=="failed"}}<input type="checkbox" rel="part2" class="grid-checkbox"/><div class="grid-label">Failed</div>{{else part2Status=="submit"}}Submitted{{else part2Status=="saved"}}Saved{{/if}}</div>',//
					  	'<div class="flex-1"><div class="ui-icon-delete-grid"></div></div>'].join(""),
			rowData : tuiForms.airForms,
			headerCls : 'air-grid-header',
			//emptyText :'No saved Forms'
		});
		$('#sendForms').addClass('send_disabled');
		tuiForms.selectedCSFForms = "";
		tuiForms.selectedSIRForms = "";
		tuiForms.selectedAIRForms = "";

	},
	airStepForm : function(formname, data, container, validationObj){
		var options = {}, form_content;
		tuiForms.currentFormOptions = {};
		//Sanity
		// for(var key in tuiForms.currentFormOptions) {
			// delete tuiForms.currentFormOptions[key];
		// }
		if(!validationObj) {
			tuiForms.validations = {};
		} else {
			tuiForms.validations = validationObj;
		}
		options.form_metadata = require("metadata/" + formname);
		options.formname = formname;
		options.data = data;
		options.container = container;
		options.current_step = 0;
		//Loading template
		$.ajax({
			url : options.form_metadata.template,
			async : false,
			success : function(content, textStatus, jqXHR) {
				form_content = $.convertTemplate(content);
			},
			error : function(content, textStatus, jqXHR) {
				throw "Unable to load template. Please check the path and name of the template"
			}
		});
		//---- step form container template --------
		form_container_template = [//
		'<div class="hbox step-form-outer">',
		'<div class="flex-1 step-tab-holder" style="font-size:18px;">',
		'{{for tabs}}',
		'<div class="air-step-form-header" id="{{:id}}">{{:name}}</div>',
		'{{/for}}',
		'</div>',
		'{{for tabs}}',
		'<div class="hbox progess-holder flex-1" id="{{:id}}-stepholder">', //
		'<div style="width:30px;"></div>',//
		'{{for steps}}', //
		'<div id="{{>#parent.parent.data.steps[#index]}}-step" ', //
		'{{if #index==0}}', //
		'class="section ">',//
		'<div class="count">{{:#index+1}}</div>', //
		'</div>', //
		'{{else}}',//
		'class="section hbox flex-2">',
		'<div class="count-line flex-1">', //
		'<div class="progress-indicator"></div>', //
		'</div>', //
		'<div class="count">{{:#index+1}}</div>', //
		'</div>', //
		'{{/if}}', //
		'{{/for}}', //
		'<div style="width:20px;"></div>', //
		'</div>', //
		'{{/for}}',	
		'</div>',
		'<div id="air-form-holder" class="flex-1" style="position:relative;">',
		'</div>',	
		].join("");
		//----------Compiling template and rendering----------
		$.templates('formcontainertemplate', form_container_template);
		$('#' + options.container).html($.render.formcontainertemplate(options.form_metadata));
		$.templates('formtemplate', form_content);
		$.link.formtemplate('#air-form-holder', options.data);
		$('#' + options.form_metadata.tabs[0].target).addClass("active-view");
		$('#' + options.form_metadata.tabs[0].steps[0]).addClass("active-view");
		options.activeTab = 0;
		options.tabStep = []; 
		for(var i=0; i < options.form_metadata.tabs.length; i++){
			options.tabStep.push(0);
			$('#'+options.form_metadata.tabs[i].id).data('stepData',{
				target : options.form_metadata.tabs[i].target,
				index : i
			})
			$('#' + options.form_metadata.tabs[i].steps[options.tabStep[0]] + '-step').addClass('current');
			$('#'+options.form_metadata.tabs[i].id).on('tap',tuiForms.airController.changeTab);
			$('#' + options.form_metadata.tabs[i].id + '-stepholder').hide();
		} 
		$('#' + options.form_metadata.tabs[0].id + '-stepholder').show();
		$('#' + options.form_metadata.tabs[0].id).addClass('selected');
		if(!$("#" + container).data("swipeEventBinded")){
			$("#" + container).data("swipeEventBinded",true);
			$('#' + options.container).on('swipeRight', tuiForms.airController.formSwipeRight);
			$('#' + options.container).on('swipeLeft', tuiForms.airController.formSwipeLeft);			
		}
		// //----------------------------------------------------
		// if(!$("#" + container).data("swipeEventBinded")){
			// $("#" + container).data("swipeEventBinded",true);
			// $('#' + options.container).on('swipeRight', tuiForms.util.formSwipeRight);
			// $('#' + options.container).on('swipeLeft', tuiForms.util.formSwipeLeft);			
		// }
		// $('#' + options.form_metadata.steps[options.current_step]).addClass('active-view');
		// $('#' + options.form_metadata.steps[options.current_step] + '-step').addClass('current');
		tuiForms.currentFormOptions = options;
		// $('#' + options.container).find("[rel='tooltip']").tooltip();
// 
		// $('#' + options.container).find("[rel='tooltip']").on('tap', function(e) {
			// $(e.target).tooltip('show')
		// });
		
	},
	changeTab : function(event){
		var options = tuiForms.currentFormOptions;
		if($(event.target).data('stepData').index == 1 && tuiForms.currentFormOptions.data.part1Status!="submit"  && tuiForms.currentFormOptions.data.part2Status!="submit"  && tuiForms.currentFormOptions.data.part1Status!="failed"){
			tuiForms.showAlert("Please submit part1, to continue to part2");
			return;
		}
		for(var i=0; i < options.form_metadata.tabs.length; i++){
			$('#' + options.form_metadata.tabs[i].target).removeClass('active-view');
			$('#' + options.form_metadata.tabs[i].id + '-stepholder').hide();
			$('#' + options.form_metadata.tabs[i].id).removeClass('selected');
		} 
		options.activeTab = $(event.target).data('stepData').index;
		$('#' + options.form_metadata.tabs[options.activeTab].id + '-stepholder').show();
		$('#' + options.form_metadata.tabs[options.activeTab].id).addClass('selected'); 
		$('#' + $(event.target).data('stepData').target).addClass('active-view');
		$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]]).addClass("active-view");
	},
	formSwipeRight : function(event) {
		if(tuiForms.mobiscrollOpen){
			return;
		}
		var options = tuiForms.currentFormOptions;
		// alert("New swipe");
		if(options.tabStep[options.activeTab] > 0) {
			$('#viewport').append('<div class="animation-mask"></div>');
			if(document.activeElement.nodeName === "TEXTAREA" || document.activeElement.nodeName === "INPUT" || document.activeElement.nodeName === "SELECT") {
				$(document.activeElement).blur();
			}
			tuiForms.airController.checkMandatoryFields(options);
			tuiForms.airController.animateToPrevFrom(options);
		}
		else{
		}
	},
	formSwipeLeft : function(event) {
		if(tuiForms.mobiscrollOpen){
			return;
		}
		var options = tuiForms.currentFormOptions;
		if(options.tabStep[options.activeTab] < (options.form_metadata.tabs[options.activeTab].steps.length-1)) {
			$('#viewport').append('<div class="animation-mask"></div>');
			if(document.activeElement.nodeName === "TEXTAREA" || document.activeElement.nodeName === "INPUT" || document.activeElement.nodeName === "SELECT") {
				$(document.activeElement).blur();
			}
			tuiForms.airController.checkMandatoryFields(options);
			tuiForms.airController.animateToNextFrom(options);
		}
		else{
		}

	},
		checkMandatoryFields : function(options) {

		var currentStep = options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]];
		var currentMandatoryFields = options.form_metadata.mandatoryFields[currentStep];
		console.log('Mandatory Field ' + currentMandatoryFields);
		var count = 0;
		if(currentMandatoryFields) {
			for(var i = 0; i < currentMandatoryFields.length; i++) {
				if(!tuiForms.validations[currentMandatoryFields[i]]) {
					tuiForms.validations[currentMandatoryFields[i]] = {};
				}
				if(currentStep =='detail_desc'){
					if($('.' + currentMandatoryFields[i]).is('select')) {
					if($('.' + currentMandatoryFields[i]).val().trim().length == 0) {
						$('.' + currentMandatoryFields[i]).addClass('mandatory-error-field');
						count = count + 1;
						tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
						tuiForms.validations[currentMandatoryFields[i]].errorMessage = "This is a mandatory Field";

					}

				}
				else if($('.' + currentMandatoryFields[i]).is('textarea')) {
					//console.log('dfsdfds' +currentMandatoryFields[i]);
					if($('.' + currentMandatoryFields[i]).val().trim().length == 0) {
						$('.' + currentMandatoryFields[i]).addClass('mandatory-error-field');
						count = count + 1;
						tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
						tuiForms.validations[currentMandatoryFields[i]].errorMessage = "This is a mandatory Field";
					}
					else{
					tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
					}
				}
				}else{
				if($('#' + currentMandatoryFields[i]).is('input')) {
//alert($('#sumAccept').val().trim().length);
					if($('#' + currentMandatoryFields[i]).val().trim().length == 0) {
						$('#' + currentMandatoryFields[i]).addClass('mandatory-error-field');
						count = count + 1;
						tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
						tuiForms.validations[currentMandatoryFields[i]].errorMessage = "This is a mandatory Field";
					}
					else{
					tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
					}
				} else if($('#' + currentMandatoryFields[i]).is('select')) {
					// alert('asvd'+$('#' +currentMandatoryFields[i]+'option:selected').attr("selectedIndex"));
					// alert($('#' +currentMandatoryFields[i]+'option:selected').length);
					//console.log(($('#' + currentMandatoryFields[i]).val().trim().length));
					//if($('#' + currentMandatoryFields[i] +'option:selected').text().length == 0){
					if($('#' + currentMandatoryFields[i]).val().trim().length == 0) {
						$('#' + currentMandatoryFields[i]).addClass('mandatory-error-field');
						count = count + 1;
						tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
						tuiForms.validations[currentMandatoryFields[i]].errorMessage = "This is a mandatory Field";

					}

				}
				else if($('#' + currentMandatoryFields[i]).is('textarea')) {
					console.log('dfsdfds' +currentMandatoryFields[i]);
					if($('#' + currentMandatoryFields[i]).val().trim().length == 0) {
						$('#' + currentMandatoryFields[i]).addClass('mandatory-error-field');
						count = count + 1;
						tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
						tuiForms.validations[currentMandatoryFields[i]].errorMessage = "This is a mandatory Field";
					}
					else{
					tuiForms.validations[currentMandatoryFields[i]].mandatoryError = true;
					}
				}
			}
			}
		}
		if(count > 0) {
			return false;
		} else {
			return true;
		}

	},
	animateToNextFrom : function(options) {
		$('.tooltip').remove();
		var current_step = $('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]]);
		var next_step = $('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab] + 1]);
		next_step.addClass('active-view');
		$(next_step).animatePage('slidein');
		current_step.removeClass('active-view');
		current_step.addClass('prev-view');
		current_step.animatePage('slideout');
		$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]] + '-step').toggleClass('current completed');
		$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab] + 1] + '-step').addClass('current');
		current_step.bind('webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationEnd', function(event) {
			$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]]).removeClass('prev-view');
			$('#viewport').find('.animation-mask').remove();
			$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]]).unbind(event);
			options.tabStep[options.activeTab]++;
			if(tuiForms.compensationScroller){
				tuiForms.compensationScroller.refresh();
			}
		});
	},
	animateToPrevFrom : function(options) {
		$(".tooltip").remove();
		var current_step = $('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]]);
		var next_step = $('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab] - 1]);
		next_step.addClass('active-view');
		$(next_step).animatePage('slideinReverse');
		current_step.removeClass('active-view');
		current_step.addClass('prev-view');
		current_step.animatePage('slideoutReverse');
		$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]] + '-step').removeClass('current');
		$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab] - 1] + '-step').toggleClass('completed current');
		current_step.bind('webkitAnimationEnd mozAnimationEnd msAnimationEnd oAnimationEnd animationEnd', function(event) {
			$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]]).removeClass('prev-view');
			$('#viewport').find('.animation-mask').remove();
			$('#' + options.form_metadata.tabs[options.activeTab].steps[options.tabStep[options.activeTab]]).unbind(event);
			options.tabStep[options.activeTab]--;
			if(tuiForms.compensationScroller){
				tuiForms.compensationScroller.refresh();
			}			
		});
	},
	submitAIRPart1 : function(){
		var options = tuiForms.currentFormOptions;
		tuiForms.airController.checkMandatoryFields(options);
		if($('#airCustomerTab').find(".mandatory-error-field").length > 0) {
			tuiForms.showAlert("All mandatory fields should be filled");
			return;
		}
		if($('#airCustomerTab').find(".errorField").length > 0) {
			if($('#airCustomerTab').find(".errorField").length == 1) {
				tuiForms.showAlert("A field contains invalid value");
			} else {
				tuiForms.showAlert("Some fields contains invalid value");
			}
			return;
		}
		$('#' + options.container).find("[type='text']").trigger('change');
		$('#' + options.container).find("[type='tel']").trigger('change');
		$('#' + options.container).find("[type='number']").trigger('change');
		$('#airCustomerTab').find("[type='date']").trigger('change');
		$('#airCustomerTab').find("[type='time']").trigger('change');
		//-------------
		// options.data.part1Status = "submit"
		// if(!tuiForms.userEmailID){
			// tuiForms.showAlert("Advisor email id is not yet set. Go to settings to update the email id");
			// return;
		// }
		// if(tuiForms.models.AIRModel.findByAttribute("id", options.data.id)) {
			// tuiForms.util.updateFormData({
				// id : options.data.id,
				// dataPart1 : JSON.stringify(options.data),
				// status : "submit",
				// editMode : "NO",
			// });
			// } else {
				// tuiForms.util.saveFormToDb({
				// id : options.data.id,
				// formType : options.formname,
				// dataPart1 : JSON.stringify(options.data),
				// status : "submit",
				// editMode : "NO",
			// });
		// }
		// options.data.save();
		// tuiForms.showAlert("Form Submitted");
		// $.navigatePage(tuiForms.views.dashboardView, 'slideinReverse', 'slideoutReverse');
		// tuiForms.util.refreshAll();
		// tuiForms.util.refreshPodGrid();
		//-------------
		
		tuiForms.body.loadingMask("show", {
			title : "Submitting Form",
		});
		var form_report = tuiForms.util.generateAIRReport(options);
		tuiForms.currentFormOptions.form_report = form_report;
		if(!tuiForms.userEmailID){
			tuiForms.showAlert("Advisor email id is not yet set. Go to settings to update the email id");
			$("body").loadingMask("hide");
			return;
		}
		var form_data = options.data;
		form_data.status = "saved";
		form_data.part1Status = "saved"
		if(options.formname == "air") {
			if(tuiForms.models.AIRModel.findByAttribute("id", form_data.id)) {
				tuiForms.util.updateFormData({
					id : options.data.id,
					dataPart1 : JSON.stringify(options.data),
					validation : JSON.stringify(tuiForms.validations),
					report1 : form_report,
					status : "saved",
					editMode : "NO",
					attachment : options.data.attachmentUrl,
				});
			} else {
				tuiForms.util.saveFormToDb({
					id : options.data.id,
					formType : options.formname,
					dataPart1 : JSON.stringify(options.data),
					validation : JSON.stringify(tuiForms.validations),
					report1 : form_report,
					status : "saved",
					editMode : "NO",
					attachment : options.data.attachmentUrl,
				});
			}
			form_data.save();
			if(networkStatus == "online") {
				tuiForms.util.sendMail({
				from : tuiForms.fromEmail,
				to : options.data.customerSignature,
				subject : "AIR Form Report",
				body : form_report,
				attachment : "",
				successCB : function(s) {
					//tuiForms.util.deleteFormData(options.data.id);
					$("body").loadingMask("hide");
					tuiForms.showAlert(s);
					options.data.status = "part 1 submitted";
					options.data.part1Status = "submit"
					options.data.save();
					$.navigatePage(tuiForms.views.dashboardView, 'slideinReverse', 'slideoutReverse');
					tuiForms.util.updateFormData({
						id : options.data.id,
						dataPart1 : JSON.stringify(options.data),
						validation : JSON.stringify(tuiForms.validations),
						report1 : options.form_report,
						status : "submit",
						attachment : options.data.attachmentUrl || "",
						editMode : "NO"
					});
					if(options.data.part2Status == "submit") {
						options.data.destroy();
						tuiForms.util.deleteFormData(options.data.id);
					}					
					tuiForms.util.refreshAll();
					tuiForms.util.refreshPodGrid();
					// $('#airCustomerTab').append('<div id="sicknessGridHolder-mask" class="grid-mask"></div>');
				},
				errorCB : function(e) {
					$("body").loadingMask("hide");
					tuiForms.showAlert(e);
					if(e.indexOf("Failed while sending email") == -1) {
						$.navigatePage(tuiForms.views.dashboardView, 'slideinReverse', 'slideoutReverse');
						options.data.part1Status = "failed";
						options.data.save();
						tuiForms.util.updateFormData({
							id : options.data.id,
							dataPart1 : JSON.stringify(options.data),
							validation : JSON.stringify(tuiForms.validations),
							report1 : options.form_report,
							status : "failed",
							attachment : options.data.attachmentUrl,
							editMode : "NO"
						});
					} else {
						tuiForms.invalidId = true;
						tuiForms.stepFromController.saveStepForm();
					}
					tuiForms.util.refreshAll();
					tuiForms.util.refreshPodGrid();
				}
			});
			}
			else{
				$("body").loadingMask("hide");
				tuiForms.showAlert("No network connectivity, try submitting later. \n Form is saved..");
				options.data.part1Status = "failed";
				options.data.save();
				tuiForms.util.updateFormData({
					id : options.data.id,
					dataPart1 : JSON.stringify(options.data),
					validation : JSON.stringify(tuiForms.validations),
					report1 : options.form_report,
					status : "failed",
					editMode : "NO",
					attachment : options.data.attachmentUrl,
				});
				$.navigatePage(tuiForms.views.dashboardView);
				tuiForms.util.refreshAll();
				tuiForms.util.refreshPodGrid();
			}


		}
	},
	submitAIRPart2 : function(){
		var options = tuiForms.currentFormOptions;
		tuiForms.airController.checkMandatoryFields(options);
		tuiForms.airController.checkMandatoryFields(options);
		if($('#airOfficeTab').find(".mandatory-error-field").length > 0) {
			tuiForms.showAlert("All mandatory fields should be filled");
			return;
		}
		if($('#airOfficeTab').find(".errorField").length > 0) {
			if($('#airOfficeTab').find(".errorField").length == 1) {
				tuiForms.showAlert("A field contains invalid value");
			} else {
				tuiForms.showAlert("Some fields contains invalid value");
			}
			return;
		}		

		$('#' + options.container).find("[type='text']").trigger('change');
		$('#' + options.container).find("[type='tel']").trigger('change');
		$('#' + options.container).find("[type='number']").trigger('change');
		$('#airOfficeTab').find("[type='date']").trigger('change');
		$('#airOfficeTab').find("[type='time']").trigger('change');
		//-------------
		// options.data.part2Status = "submit"
		// if(!tuiForms.userEmailID){
			// tuiForms.showAlert("Advisor email id is not yet set. Go to settings to update the email id");
			// return;
		// }
		// if(tuiForms.models.AIRModel.findByAttribute("id", options.data.id)) {
			// tuiForms.util.updateFormData({
				// id : options.data.id,
				// dataPart1 : JSON.stringify(options.data),
				// status : "submit",
				// status2 : "submit",
				// attachment : options.data.attachmentUrl,
				// editMode : "NO",
			// });
			// } else {
				// tuiForms.util.saveFormToDb({
				// id : options.data.id,
				// formType : options.formname,
				// dataPart1 : JSON.stringify(options.data),
				// status : "submit",
				// status2 : "submit",
				// attachment : options.data.attachmentUrl,
				// editMode : "NO",
			// });
		// }
		// options.data.destroy();
		// tuiForms.showAlert("Form Submitted");
		// $.navigatePage(tuiForms.views.dashboardView, 'slideinReverse', 'slideoutReverse');
		// tuiForms.util.refreshAll();
		// tuiForms.util.refreshPodGrid();
		//-------------
		
		tuiForms.body.loadingMask("show", {
			title : "Submitting Form",
		});
		var form_report2 = tuiForms.util.generateAIRReport2(options);
		var form_report1 = tuiForms.util.generateAIRReport(options);
		if(!tuiForms.userEmailID){
			tuiForms.showAlert("Advisor email id is not yet set. Go to settings to update the email id");
			$("body").loadingMask("hide");
			return;
		}
		var form_data = options.data;
		form_data.status = "submit";
		form_data.part2Status = "saved"
		if(options.formname == "air") {
			if(tuiForms.models.AIRModel.findByAttribute("id", form_data.id)) {
				tuiForms.util.updateFormData({
					id : options.data.id,
					dataPart1 : JSON.stringify(options.data),
					validation : JSON.stringify(tuiForms.validations),
					report1 : form_report1,
					report2 : form_report2,
					status : form_data.part1Status,
					status2 : "saved",
					editMode : "NO",
					attachment : options.data.attachmentUrl,
				});
			} else {
				tuiForms.util.saveFormToDb({
					id : options.data.id,
					formType : options.formname,
					dataPart1 : JSON.stringify(options.data),
					validation : JSON.stringify(tuiForms.validations),
					report1 : form_report1,
					report2 : form_report2,
					status : form_data.part1Status,
					status2 : "saved",					
					editMode : "NO",
					attachment : options.data.attachmentUrl,
				});
			}
			form_data.save();
			if(networkStatus == "online") {
					tuiForms.mailToRTM = '';
			try{
			if(options.data.rtmMailId == "other") {
				tuiForms.mailToRTM = options.data.rtmMailIdOther;
			} else {
				tuiForms.mailToRTM = options.data.rtmMailId;
			}
			}
			catch(e){
				tuiForms.showAlert(e);
			}
				tuiForms.util.sendMail({
				from : tuiForms.fromEmail,
				bccEmail: [tuiForms.userEmailID,options.data.contactEmail, tuiForms.mailToRTM, tuiForms.cyprusEmail].join(","),
				attachment : options.data.attachmentUrl || "",
				subject : "AIR Form Report",
				body : form_report2,
				successCB : function(s) {
					$("body").loadingMask("hide");
					tuiForms.showAlert(s);
					options.data.part2Status = "submit";
					options.data.save();
					tuiForms.util.updateFormData({
						id : options.data.id,
						dataPart1 : JSON.stringify(options.data),
						validation : JSON.stringify(tuiForms.validations),
					report1 : form_report1,
					report2 : form_report2,
						status : options.data.part1Status,
						status2 : "submit",
						editMode : "NO",
						attachment : options.data.attachmentUrl,
					});
					if(options.data.part1Status == "submit") {
						options.data.destroy();
						tuiForms.util.deleteFormData(options.data.id);
					}
					$.navigatePage(tuiForms.views.dashboardView);
					tuiForms.util.refreshAll();
					tuiForms.util.refreshPodGrid();
				},
				errorCB : function(e) {
					$("body").loadingMask("hide");
					tuiForms.showAlert(e);
					if(e.indexOf("Failed while sending email") == -1) {
						options.data.part2Status = "failed";
						options.data.save();
						tuiForms.util.updateFormData({
							id : options.data.id,
							dataPart1 : JSON.stringify(options.data),
							validation : JSON.stringify(tuiForms.validations),
							report1 : form_report1,
							report2 : form_report2,
							status : options.data.part1Status,
							status2 : "failed",
							editMode : "NO",
							attachment : options.data.attachmentUrl,
						});
						$.navigatePage(tuiForms.views.dashboardView, 'slideinReverse', 'slideoutReverse');
					} else {
						tuiForms.invalidId = true;
						tuiForms.stepFromController.saveStepForm();
					}
					tuiForms.util.refreshAll();
					tuiForms.util.refreshPodGrid();
				}
			});
			}
			else{
				$("body").loadingMask("hide");
				tuiForms.showAlert("No network connectivity, try submitting later. \n Form is saved..");
				options.data.part2Status = "failed";
				options.data.save();
				$.navigatePage(tuiForms.views.dashboardView, 'slideinReverse', 'slideoutReverse');
				tuiForms.util.updateFormData({
				id : options.data.id,
				dataPart1 : JSON.stringify(options.data),
				validation : JSON.stringify(tuiForms.validations),
				report1 : form_report1,
				report2 : form_report2,
				status : options.data.part1Status,
				status2 : options.data.part2Status,
				attachment : options.data.attachmentUrl,
				editMode : "NO"
				});
				tuiForms.util.refreshAll();
				tuiForms.util.refreshPodGrid();
			}
		}
	},
});
