/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author 
 */
define(['N/ui/message',																		
       		'N/ui/dialog',																
    		'N/runtime',																
    		'N/currentRecord',															
    		'N/url',																
    		'N/search',
    		'N/record',
    		'/SuiteScripts/PAA/ps_common_paa', 'N/https'],

function(message, dialog, runtime, currentRecord, url, search, record,common, http) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    	try{	
        	var type = scriptContext.mode;
    		var currentRecord = scriptContext.currentRecord;
    		currentRecord.getField("custrecord_ns_policy_no").isDisabled = true;
    		currentRecord.getField("name").isDisabled = true;
	    	setTableHIDDEN('custom_wrapper');  
	    	setTableHIDDEN('customtxt');
	    		    	
	    	var currentUrl = window.location.href;
	    	var url = new URL(currentUrl);
	    	var params = new URLSearchParams(url.search);
	    	//施策
	    	var division = params.get('division');
	    	if(!isEmpty(division)){
	    		var value = division.split(',');
	    		if(!isEmpty(value)){
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_division',value: value,ignoreFieldChange: true,});
					currentRecord.setValue({fieldId: 'custpage_division',value: value,ignoreFieldChange: true,});
	    		}
	    	}
	    	//予算年度
    		var budgetYear = '';
	    	if(params.get('yearid')){
	    		budgetYear = params.get('yearid')
	    	}else{
	    		budgetYear = currentRecord.getValue({fieldId: 'custrecord_ns_policy_cancel_budget_year'});
	    	}	
	    	
	    	//部門 
	    	var budgetMent = ''
	    	if(params.get('budgetMent')){
	    		budgetMent =  params.get('budgetMent')
	    	}else{
				budgetMent = currentRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
	    	}
	    	
	    	//予算参照部門ID
	    	var departmentString = '';
   			if(!isEmpty(budgetMent)){
				//部門レコード
				var mentRecord = record.load({type: 'department',id: budgetMent,isDynamic: true});
				//部門レコード - NS_予算参照部門
				var mentBuget = mentRecord.getValue({fieldId: 'custrecord_ns_budget_ref_department'});
				if(!isEmpty(mentBuget)){
					departmentString = mentBuget.toString();
					currentRecord.setValue({fieldId: 'custrecord_ns_policy_departmentid',value: departmentString,ignoreFieldChange: true,});					
				}
			}
	    		
	    	var currentUrl = window.location.href;
	    	var url = new URL(currentUrl);
	    	var params = new URLSearchParams(url.search);
	    	var division = params.get('division');
	    	if(type == 'create'){
	    		setFieldDisabled(currentRecord,budgetYear,departmentString,budgetMent);
	    	}else if(type == 'edit'){
	
	    		//施策
        		var divisionValue = currentRecord.getValue({fieldId: 'custrecord_ns_policy_division'});
        		if(!isEmpty(divisionValue)){
    				currentRecord.setValue({fieldId: 'custpage_division',value: divisionValue,ignoreFieldChange: true,});
        		}
        		//予算年度
    	    	if(!isEmpty(budgetYear)){
    	    		currentRecord.setValue({fieldId: 'custrecord_ns_policy_cancel_budget_year',value: budgetYear,ignoreFieldChange: true,});
    	    	}
          		//部門 
    	    	if(!isEmpty(budgetMent)){
    	    		currentRecord.setValue({fieldId: 'custrecord_ns_policy_budget_department',value: budgetMent,ignoreFieldChange: true,});
    	    	}
	    	}
    	} catch (e) {
            
  		}
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
    	try{    		
			var policyRecord = scriptContext.currentRecord;
			var recordId = policyRecord.id;
			//部門 
			if(scriptContext.fieldId == 'custrecord_ns_policy_budget_department'){
    			var budgetMent = policyRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
    			if(!isEmpty(budgetMent)){
    				//部門レコード
    				var mentRecord = record.load({type: 'department',id: budgetMent,isDynamic: true});
    				//部門レコード - NS_予算参照部門
    				var mentBuget = mentRecord.getValue({fieldId: 'custrecord_ns_budget_ref_department'});
    				if(!isEmpty(mentBuget)){
    					var departmentString = mentBuget.toString();
    					policyRecord.setValue({fieldId: 'custrecord_ns_policy_departmentid',value: departmentString,ignoreFieldChange: false,});
    					policyRecord.setValue({fieldId: 'custrecord_ns_policy_cancel_budget_year',value: '',ignoreFieldChange: true,});
    					policyRecord.setValue({fieldId: 'custrecord_ns_policy_type',value: '',ignoreFieldChange: true,});
    	    			setFieldDisabled(policyRecord,budgetYear,departmentString,budgetMent);
    				}
    			}
			}
						
			//予算参照部門ID || 予算年度 ||  NS_稟議タイプ
    		if(scriptContext.fieldId == 'custrecord_ns_policy_cancel_budget_year' || scriptContext.fieldId == 'custrecord_ns_policy_departmentid' || scriptContext.fieldId == 'custrecord_ns_policy_type'){
        		//URL
        		var currentUrl = window.location.href;
        		var oldCurrentUrl = '';
    			//予算参照部門ID Value
    			var department = policyRecord.getValue({fieldId: 'custrecord_ns_policy_departmentid'});
    			//予算年度 Value
    			var budgetYear = policyRecord.getValue({fieldId: 'custrecord_ns_policy_cancel_budget_year'});
    	    	//部門  Value
    			var budgetMent = policyRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
    	    	//NS_稟議タイプ   Value
    			var policyType = policyRecord.getValue({fieldId: 'custrecord_ns_policy_type'});
    			//ジャンプ			
    			var index = currentUrl.indexOf("&yearid=");
    			if(index == -1){
    				if(!isEmpty(budgetYear) && !isEmpty(department) && !isEmpty(budgetMent) && !isEmpty(policyType)){
        				currentUrl = currentUrl+"&yearid="+budgetYear + "&departmentid="+department + "&budgetMent="+budgetMent + "&policyType="+policyType;
    					window.ischanged = false;
    					window.location.href=currentUrl;
    				}
    			}else{
    				if(!isEmpty(budgetYear) && !isEmpty(department) && !isEmpty(budgetMent) && !isEmpty(policyType)){
    					oldCurrentUrl = currentUrl.substring(0, index);
    					currentUrl = oldCurrentUrl+"&yearid="+budgetYear + "&departmentid="+department + "&budgetMent="+budgetMent + "&policyType="+policyType;
    					window.ischanged = false;
    					window.location.href=currentUrl;
    				}
    			}
    		}   
    		
    		
    	} catch (e) {
            
  		}
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	try{
    		var policyRecord = scriptContext.currentRecord;
    		var recordId = policyRecord.id;
        	var policyType = policyRecord.getValue({//NS_稟議タイプ
        		fieldId: 'custrecord_ns_policy_type'
        	});
        	//予算年度 
        	var year = policyRecord.getValue({fieldId: 'custrecord_ns_policy_cancel_budget_year'});
        	//予算参照部門ID
        	var department = policyRecord.getValue({fieldId: 'custrecord_ns_policy_departmentid'});
        	//部門
			var budgetMent = policyRecord.getValue({fieldId: 'custrecord_ns_policy_budget_department'});
			//件名
        	var fileName = policyRecord.getValue({ fieldId: 'custrecord_ns_policy_file_name'});
        	//の主旨と効果（3000文字まで）
        	var memo = policyRecord.getValue({fieldId: 'custrecord_ns_policy_memo'});
        	//稟議完了希望日
        	var date = policyRecord.getValue({fieldId: 'custrecord_ns_policy_desired_date'});
        	//稟議ＮＯ
        	var policyNo  = policyRecord.getValue({fieldId: 'custrecord_ns_policy_no'});
        	//NS_稟議承認ステータス
        	var policyStatus = policyRecord.getValue({fieldId: 'custrecord_ns_policy_status'});
        	var policyName = policyNo + " " + fileName;
        	//NS_利用済発注書金額
        	var poUsedAmount = Number(policyRecord.getValue({fieldId: 'custrecord_ns_policy_po_used_amount'}));
        	//NS_利用済支払請求書金額
        	var vbUsedAmount = Number(policyRecord.getValue({fieldId: 'custrecord_ns_policy_vb_used_amount'}));
        	policyRecord.setValue({fieldId: 'name',value: policyName,});	
        	var amountTotal = 0; //稟議総額
        	var revisedAmountTotal = 0; //稟議総額
        	var poResidueTotal = 0;//発注書稟議残額
        	var vbResidueTotal = 0;//支払請求書稟議残額
        	
        	var headDivisionValue = policyRecord.getValue({fieldId: 'custrecord_ns_policy_division'});
        	if(!isEmpty(headDivisionValue)){
                	var searchType = 'customrecord_ns_ps_name_list';
                	var searchFilters = [];
                	searchFilters.push(["internalid",'anyof',headDivisionValue]);
                	var searchColumns = [search.createColumn({
     	                name : "custrecord_ns_ringi_division_list",
     	                label : "NS_予算"
                	})];
                	var idString = ''
                	var divisionResults = createSearch(searchType, searchFilters, searchColumns);
                	if (divisionResults && divisionResults.length > 0) {
                		 for (var i = 0; i < divisionResults.length; i++) {
                			 var divisionResult = divisionResults[i];
                			 var id = divisionResult.getValue(searchColumns[0]);
                			 idString += id+",";
                		 }
                	}
                	if(!isEmpty(idString)){
                		var newIdString = idString.slice(0, -1);
                		if(!isEmpty(newIdString)){
                		    policyRecord.setValue({
                				fieldId: 'custrecord_ns_policy_budget_id',
                				value: newIdString,
                			});	
                		}
                	}
        	}
        	
        	var lineDivisionIdArr = new Array();
        	var numLines = policyRecord.getLineCount({sublistId: 'recmachcustrecord_ns_policy_screen'});
        	var lines = document.getElementById("line").innerText;//行数
			//if(policyStatus != '14'){
				//for (var x = numLines - 1; x >= 0; x--) {
					//var internalid = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'id',line: x});
					//if(!isEmpty(internalid)){
						//policyRecord.removeLine({sublistId: 'recmachcustrecord_ns_policy_screen',line: x,ignoreRecalc: true});
					//}
				//}
				
			//}else{
				var lineDivisionIdArr = new Array();
				if(lines >= 1){
					 for(var i = 0;i < lines; i++){
						 var divisionid=document.getElementById("divisionid"+i).innerText;//施策ID
						 lineDivisionIdArr.push(divisionid);
					 }
					 
					 for (var x = numLines - 1; x >= 0; x--) {
						 var divisionid = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_measures',line: x});
						 if(lineDivisionIdArr.indexOf(divisionid) < 0){
							 policyRecord.removeLine({sublistId: 'recmachcustrecord_ns_policy_screen',line: x,ignoreRecalc: true});
					 	 }
					 }
				}
			//}
    		if(lines >= 1){
    		    for(var i = 0;i < lines; i++){
    		    	var policyList=document.getElementById("policylistid"+i).innerText;//NS_稟議リスト
    		    	var budgetid=document.getElementById("budgetid"+i).innerText;//予算ID
        			var projectid=document.getElementById("project"+i).innerText;//大項目
        			var divisionid=document.getElementById("divisionid"+i).innerText;//施策ID
        			var areaid=document.getElementById("areaid"+i).innerText;//地域ID
        			var blandid=document.getElementById("blandid"+i).innerText;//ブランドID        	
        			var accountid=document.getElementById("accountid"+i).innerText;//勘定科目ID   
        			//1-12月現在額
        			var aug=document.getElementById("aug"+i).value;//8月
        			var sep=document.getElementById("sep"+i).value;//9月
        			var oct=document.getElementById("oct"+i).value;//10月
        			var nov=document.getElementById("nov"+i).value;//11月
        			var dec=document.getElementById("dec"+i).value;//12月
        			var jan=document.getElementById("jan"+i).value;//1月
        			var feb=document.getElementById("feb"+i).value;//2月
        			var mar=document.getElementById("mar"+i).value;//3月
        			var apr=document.getElementById("apr"+i).value;//4月
        			var may=document.getElementById("may"+i).value;//5月
        			var jun=document.getElementById("jun"+i).value;//6月
        			var jul=document.getElementById("jul"+i).value;//7月      			       			
        			var mounth=document.getElementById("mounth"+i).value;//来期以降総額
        			var amount=document.getElementById("amount"+i).innerText;//取得金額
        			var totalValue = Number(aug)+Number(sep)+Number(oct)+Number(nov)+Number(dec)+Number(jan)+Number(feb)+Number(mar)+Number(apr)+Number(may)+Number(jun)+Number(jul);//現在の金額
        			var rateTotal = Number(totalValue) + Number(mounth);
        			amountTotal += Number(rateTotal);
        			var total = document.getElementById("total"+i).innerText = Number(totalValue) + Number(mounth);//合計
        			
        			if(isNaN(Number(aug)) || isNaN(Number(sep)) || isNaN(Number(oct)) || isNaN(Number(nov)) || isNaN(Number(dec)) || isNaN(Number(jan)) || isNaN(Number(feb)) || isNaN(Number(mar)) || isNaN(Number(apr)) || isNaN(Number(may)) || isNaN(Number(jun)) || isNaN(Number(jul)) || isNaN(Number(mounth))){
        				alert("月別稟議額は数字のみ入力できますので、再入力してください。");
        				return false;
        			}else{
        				if( isEmpty(year) ||  isEmpty(department) ||  isEmpty(fileName) ||  isEmpty(memo) ||  isEmpty(date) || isEmpty(policyType) || isEmpty(budgetMent)){
        					alert("必入項目を入力してください。");
        					return false;
        				}else{    						
        					policyRecord.selectLine({sublistId: 'recmachcustrecord_ns_policy_screen',line: i});
        					if(policyStatus != '14'){
        						poResidueTotal += Number(rateTotal);//発注書稟議残額
        						vbResidueTotal += Number(rateTotal);//支払請求書稟議残額
            					//8月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_8_invoice',value: aug,ignoreFieldChange: true});
            					//9月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_9_invoice',value: sep,ignoreFieldChange: true});
            					//10月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_10_invoice',value: oct,ignoreFieldChange: true});
            					//11月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_11_invoice',value: nov,ignoreFieldChange: true});
            					//12月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_12_invoice',value: dec,ignoreFieldChange: true});
            					//1月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_1_invoice',value: jan,ignoreFieldChange: true});
            					//2月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_2_invoice',value: feb,ignoreFieldChange: true});
            					//3月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_3_invoice',value: mar,ignoreFieldChange: true});
            					//4月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_4_invoice',value: apr,ignoreFieldChange: true});
            					//5月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_5_invoice',value: may,ignoreFieldChange: true});
            					//6月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_6_invoice',value: jun,ignoreFieldChange: true});
            					//7月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_7_invoice',value: jul,ignoreFieldChange: true});
            					
            					
            					//8月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_8_residual',value: aug,ignoreFieldChange: true});
            					//9月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_9_residual',value: sep,ignoreFieldChange: true});
            					//10月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_10_residual',value: oct,ignoreFieldChange: true});
            					//11月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_11_residual',value: nov,ignoreFieldChange: true});
            					//12月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_12_residual',value: dec,ignoreFieldChange: true});
            					//1月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_1_residual',value: jan,ignoreFieldChange: true});
            					//2月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_2_residual',value: feb,ignoreFieldChange: true});
            					//3月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_3_residual',value: mar,ignoreFieldChange: true});
            					//4月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_4_residual',value: apr,ignoreFieldChange: true});
            					//5月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_5_residual',value: may,ignoreFieldChange: true});
            					//6月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_6_residual',value: jun,ignoreFieldChange: true});
            					//7月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_7_residual',value: jul,ignoreFieldChange: true});
        					}else{
        						
        	        			var residualTotalValue = Number(aug)+Number(sep)+Number(oct)+Number(nov)+Number(dec)+Number(jan)+Number(feb)+Number(mar)+Number(apr)+Number(may)+Number(jun)+Number(jul);//現在の金額
        	        			var revisedTotal = Number(residualTotalValue) + Number(mounth);
        	        			revisedAmountTotal += Number(revisedTotal);
        						
            					//原8月稟議残額
        						var residualold_8 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_8_residual'})
        						//原9月稟議残額
        						var residualold_9 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_9_residual'})
        						//原10月稟議残額
        						var residualold_10 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_10_residual'})
        						//原11月稟議残額
        						var residualold_11 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_11_residual'})
        						//原12月稟議残額
        						var residualold_12 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_12_residual'})
        						//原1月稟議残額
        						var residualold_1 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_1_residual'})
        						//原2月稟議残額
        						var residualold_2 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_2_residual'})
        						//原3月稟議残額
        						var residualold_3 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_3_residual'})
        						//原4月稟議残額
        						var residualold_4 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_4_residual'})
        						//原5月稟議残額
        						var residualold_5 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_5_residual'})
        						//原6月稟議残額
        						var residualold_6 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_6_residual'})
        						//原7月稟議残額
        						var residualold_7 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_7_residual'})
       						
        						//原8月
        						var amount_8 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_aug'})
        						//原9月
        						var amount_9 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_sep'})
        						//原10月
        						var amount_10 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_oct'})
        						//原11月
        						var amount_11 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_nov'})
        						//原12月
        						var amount_12 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_dec'})
        						//原1月
        						var amount_1 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_jan'})
        						//原2月
        						var amount_2 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_feb'})
        						//原3月
        						var amount_3 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_mar'})
        						//原4月
        						var amount_4 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_apr'})
        						//原5月
        						var amount_5 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_may'})
        						//原6月
        						var amount_6 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_jun'})
        						//原7月
        						var amount_7 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_jul'})
        						
        						//新稟議残額
        						var newResidual_8 = Number(residualold_8) + (Number(aug) - Number(amount_8));
        						var newResidual_9 = Number(residualold_9) + (Number(sep) - Number(amount_9));				
        						var newResidual_10 = Number(residualold_10) + (Number(oct) - Number(amount_10));
        						var newResidual_11 = Number(residualold_11) + (Number(nov) - Number(amount_11));
        						var newResidual_12 = Number(residualold_12) + (Number(dec) - Number(amount_12));
        						var newResidual_1 = Number(residualold_1) + (Number(jan) - Number(amount_1));
        						var newResidual_2 = Number(residualold_2) + (Number(feb) - Number(amount_2));
        						var newResidual_3 = Number(residualold_3) + (Number(mar) - Number(amount_3));
        						var newResidual_4 = Number(residualold_4) + (Number(apr) - Number(amount_4));
        						var newResidual_5 = Number(residualold_5) + (Number(may) - Number(amount_5));
        						var newResidual_6 = Number(residualold_6) + (Number(jun) - Number(amount_6));
        						var newResidual_7 = Number(residualold_7) + (Number(jul) - Number(amount_7));
        						
        						//原8月請求残額
        						var invoice_8 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_8_invoice'})
        						//原9月請求残額
        						var invoice_9 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_9_invoice'})
        						//原10月請求残額
        						var invoice_10 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_10_invoice'})
        						//原11月請求残額
        						var invoice_11 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_11_invoice'})
        						//原12月請求残額
        						var invoice_12 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_12_invoice'})
        						//原1月請求残額
        						var invoice_1 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_1_invoice'})
        						//原2月請求残額
        						var invoice_2 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_2_invoice'})
        						//原3月請求残額
        						var invoice_3 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_3_invoice'})
        						//原4月請求残額
        						var invoice_4 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_4_invoice'})
        						//原5月請求残額
        						var invoice_5 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_5_invoice'})
        						//原6月請求残額
        						var invoice_6 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_6_invoice'})
        						//原7月請求残額
        						var invoice_7 = policyRecord.getCurrentSublistValue({ sublistId: 'recmachcustrecord_ns_policy_screen', fieldId: 'custrecord_ns_policy_month_7_invoice'})
        						
        						//新請求残額
        						var newInvoice_8 = Number(invoice_8) + (Number(aug) - Number(amount_8));
        						var newInvoice_9 = Number(invoice_9) + (Number(sep) - Number(amount_9));				
        						var newInvoice_10 = Number(invoice_10) + (Number(oct) - Number(amount_10));
        						var newInvoice_11 = Number(invoice_11) + (Number(nov) - Number(amount_11));
        						var newInvoice_12 = Number(invoice_12) + (Number(dec) - Number(amount_12));
        						var newInvoice_1 = Number(invoice_1) + (Number(jan) - Number(amount_1));
        						var newInvoice_2 = Number(invoice_2) + (Number(feb) - Number(amount_2));
        						var newInvoice_3 = Number(invoice_3) + (Number(mar) - Number(amount_3));
        						var newInvoice_4 = Number(invoice_4) + (Number(apr) - Number(amount_4));
        						var newInvoice_5 = Number(invoice_5) + (Number(may) - Number(amount_5));
        						var newInvoice_6 = Number(invoice_6) + (Number(jun) - Number(amount_6));
        						var newInvoice_7 = Number(invoice_7) + (Number(jul) - Number(amount_7));
        						
            					//8月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_8_residual',value: newResidual_8,ignoreFieldChange: true});
            					//8月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_8_invoice',value: newInvoice_8,ignoreFieldChange: true});
    						
            					//9月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_9_residual',value: newResidual_9,ignoreFieldChange: true});
            					//9月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_9_invoice',value: newInvoice_9,ignoreFieldChange: true});
    					
            					//10月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_10_residual',value: newResidual_10,ignoreFieldChange: true});
            					//10月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_10_invoice',value: newInvoice_10,ignoreFieldChange: true});
    						
            					//11月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_11_residual',value: newResidual_11,ignoreFieldChange: true});
            					//11月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_11_invoice',value: newInvoice_11,ignoreFieldChange: true});
    					
            					//12月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_12_residual',value: newResidual_12,ignoreFieldChange: true});
            					//12月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_12_invoice',value: newInvoice_12,ignoreFieldChange: true});
    						
            					//1月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_1_residual',value: newResidual_1,ignoreFieldChange: true});
            					//1月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_1_invoice',value: newInvoice_1,ignoreFieldChange: true});
    						
            					//2月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_2_residual',value: newResidual_2,ignoreFieldChange: true});
            					//2月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_2_invoice',value: newInvoice_2,ignoreFieldChange: true});
    					
            					//3月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_3_residual',value: newResidual_3,ignoreFieldChange: true});
            					//3月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_3_invoice',value: newInvoice_3,ignoreFieldChange: true});
    						
            					//4月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_4_residual',value: newResidual_4,ignoreFieldChange: true});
            					//4月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_4_invoice',value: newInvoice_4,ignoreFieldChange: true});
    					
            					//5月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_5_residual',value: newResidual_5,ignoreFieldChange: true});
            					//5月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_5_invoice',value: newInvoice_5,ignoreFieldChange: true});
    						
            					//6月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_6_residual',value: newResidual_6,ignoreFieldChange: true});
            					//6月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_6_invoice',value: newInvoice_6,ignoreFieldChange: true});
    						
            					//7月稟議残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_7_residual',value: newResidual_7,ignoreFieldChange: true});
            					//7月請求残額
            					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_7_invoice',value: newInvoice_7,ignoreFieldChange: true});
        					}
        					
        					//NS_予算
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',value: budgetid,ignoreFieldChange: true});
        					//大項目
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_project',value: projectid,ignoreFieldChange: true});
        					//施策
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_measures',value: divisionid,ignoreFieldChange: true});
        					//地域
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_area',value: areaid,ignoreFieldChange: true});
        					//ブランド
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_brand',value: blandid,ignoreFieldChange: true});
        					// NS_稟議リスト
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_list',value: policyList,ignoreFieldChange: true});
        					//勘定科目
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_account',value: accountid,ignoreFieldChange: true});
        					
        					//8月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',value: aug,ignoreFieldChange: true});
        					//9月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',value: sep,ignoreFieldChange: true});
        					//10月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',value: oct,ignoreFieldChange: true});
        					//11月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',value: nov,ignoreFieldChange: true});
        					//12月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',value: dec,ignoreFieldChange: true});
        					//1月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',value: jan,ignoreFieldChange: true});
        					//2月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',value: feb,ignoreFieldChange: true});
        					//3月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',value: mar,ignoreFieldChange: true});
        					//4月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',value: apr,ignoreFieldChange: true});
        					//5月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',value: may,ignoreFieldChange: true});
        					//6月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',value: jun,ignoreFieldChange: true});
        					//7月
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',value: jul,ignoreFieldChange: true});       					
//        					//来期以降総額
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_amount',value: mounth,ignoreFieldChange: true});
//        					//来期以降総額(支払請求書用)
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_amount_vb',value: mounth,ignoreFieldChange: true});
//        					//合計
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_total',value: total,ignoreFieldChange: true});
//        					//取得金額)
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_money',value: amount,ignoreFieldChange: true});
        					
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_residual',value: mounth,ignoreFieldChange: true});
        					policyRecord.setCurrentSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_residual_vb',value: mounth,ignoreFieldChange: true});
        					
        					policyRecord.commitLine({sublistId: 'recmachcustrecord_ns_policy_screen'});  
        					
        				}
        			}
    		    }
				poResidueTotal += Number(revisedAmountTotal)- Number(poUsedAmount);
				vbResidueTotal += Number(revisedAmountTotal)- Number(vbUsedAmount);
				
    		    policyRecord.setValue({
    				fieldId: 'custrecord_ns_policy_amount',
    				value: amountTotal,
    			});	
    		    policyRecord.setValue({
    				fieldId: 'custrecord_ns_policy_residual_amount',
    				value: poResidueTotal,
    			});	  
    		    policyRecord.setValue({
    				fieldId: 'custrecord_ns_policy_residual_amount_vb',
    				value: vbResidueTotal,
    			});	  
    		}
        	return true;
        	
    	} catch (e) {
    		alert(e)
  		}
    }
    
	function isEmpty(valueStr){
		return (valueStr == null || valueStr == '' || valueStr == undefined);
	}
    
	function setFieldDisabled(currentRecord,budgetYear,departmentString,budgetMent){
		
		//施策
    	var divisionValue = currentRecord.getValue({fieldId: 'custrecord_ns_policy_division'});
		if(!isEmpty(budgetYear) && !isEmpty(departmentString) && divisionValue!= ''){
			//削除
			currentRecord.getField("isinactive").isDisabled = false;
			//件名 
			currentRecord.getField("custrecord_ns_policy_file_name").isDisabled = false;
			//実施の主旨と効果（3000文字まで）
			currentRecord.getField("custrecord_ns_policy_memo").isDisabled = false;
			//初回発注予定日
			currentRecord.getField("custrecord_ns_policy_expected_po_date").isDisabled = false;
			//稟議完了希望日
			currentRecord.getField("custrecord_ns_policy_desired_date").isDisabled = false;
			//NS_稟議承認ステータス
			currentRecord.getField("custrecord_ns_policy_status").isDisabled = false;
			//NS_子会社
			currentRecord.getField("custrecord_ns_policy_sub").isDisabled = false;
		}else{
			//削除
			currentRecord.getField("isinactive").isDisabled = true;
			//件名 
			currentRecord.getField("custrecord_ns_policy_file_name").isDisabled = true;
			//実施の主旨と効果（3000文字まで）
			currentRecord.getField("custrecord_ns_policy_memo").isDisabled = true;
			//初回発注予定日
			currentRecord.getField("custrecord_ns_policy_expected_po_date").isDisabled = true;
			//稟議完了希望日
			currentRecord.getField("custrecord_ns_policy_desired_date").isDisabled = true;
			//NS_稟議承認ステータス
			currentRecord.getField("custrecord_ns_policy_status").isDisabled = true;
			//NS_子会社
			currentRecord.getField("custrecord_ns_policy_sub").isDisabled = true;
		}
	}
	
	
    function setTableHIDDEN(table) {
    	try {
    		document.getElementById(table).style.display = 'none';
    	} catch (e) {
    	}
    }
	
	function returnRenew(){
		try{
			var curRecord = currentRecord.get();
	        var value = curRecord.getValue({
	            fieldId : 'custpage_division'
	        });
	        var checkValue = Number(value);
	        if(checkValue == 0){
	        	alert("施策を選択してください。")
	        }else{
	            var policyStatus = curRecord.getValue({fieldId : 'custrecord_ns_policy_status'});
	            if(policyStatus == '14'){
		            var lineIdArr = new Array();
		            var lines =  curRecord.getLineCount('recmachcustrecord_ns_policy_screen');
					var idString = '';
		            if(lines >= 1){
		        		  for(var i = 0;i < lines; i++){
		        			  var lineId=document.getElementById("lineid"+i).innerText;//lineid
		        			  lineIdArr.push(lineId)
		        		  }
		    	          var searchType = "transaction";
		            	  var searchFilters = [];
		    			  if(!isEmpty(lineIdArr)){
		    				  searchFilters.push(["custcol_ns_policy_screen_lineid",'anyof',lineIdArr]);
		    			  }
		    			  var searchColumns = [search.createColumn({
		    	                name : "internalid",
		    	                label : "内部ID"
		    			  })];
		    			  var divisionResults = createSearch(searchType, searchFilters, searchColumns);
		    			  if (divisionResults && divisionResults.length > 0) {
		        		    	for (var i = 0; i < divisionResults.length; i++) {
		        	                var divisionResult = divisionResults[i];
		        	                var id = divisionResult.getValue(searchColumns[0]);
		        	                idString += id;
		        		    	}
		              	  }   			  
		            }
	            	
	            	
	            	if(!isEmpty(idString)){
	            		alert("この稟議の施策はすでに発注書に使用されており、施策変更は不可。")
	            	}else{
	                	var returnRenewValue = confirm("選択した施策で明細が更新されます。宜しいでしょうか？");
	            		if(returnRenewValue){
	            	        var oldCurrentUrl = '';
	            	        var currentUrl = window.location.href;
	            	    	var index = currentUrl.indexOf("&division=");      
	            	    	if(index == -1){
	            	    		currentUrl = currentUrl+"&division="+value;  		
	            	    	}else{
	            	    		oldCurrentUrl = currentUrl.substring(0, index);
	            	    		currentUrl = oldCurrentUrl+"&division="+value;    	    			    		
	            	    	}
	            			window.ischanged = false;
	            			window.location.href=currentUrl; 
	            		}
	            	}
	            	
	            }else{
	            	var returnRenewValue = confirm("選択した施策で明細が更新されます。宜しいでしょうか？");
	        		if(returnRenewValue){
	        	        var oldCurrentUrl = '';
	        	        var currentUrl = window.location.href;
	        	    	var index = currentUrl.indexOf("&division=");      
	        	    	if(index == -1){
	        	    		currentUrl = currentUrl+"&division="+value;  		
	        	    	}else{
	        	    		oldCurrentUrl = currentUrl.substring(0, index);
	        	    		currentUrl = oldCurrentUrl+"&division="+value;    	    			    		
	        	    	}
	        			window.ischanged = false;
	        			window.location.href=currentUrl; 
	        		}
	            } 	
	       }
		}catch(e){
			
		}
	}
	
	
	function appleFun(id){
		
		try{
			if(!isEmpty(id)){
			    var currentRecord = record.load({type: 'customrecord_ns_policy_screen',id: id,isDynamic: true});
			    var oldPolicyId = currentRecord.getValue({fieldId : 'custrecord_ns_policy_sm_create_kari_id'});
			    //old 
				if(!isEmpty(oldPolicyId)){
				    var oldRecord = record.load({type: 'customrecord_ns_policy_screen',id: oldPolicyId,isDynamic: true});
				    if(!isEmpty(oldRecord)){
				    	var oldLine = oldRecord.getLineCount('recmachcustrecord_ns_policy_screen');
	    	        	var infoDic = {};
				    	for(var p = 0 ; p < oldLine ; p++){
		    		    	//NS_予算
		    	        	var budgetId = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',line: p});
		    	        	//8月
		    	        	var old_8 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: p});
		    	        	//9月
		    	        	var old_9 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: p});
		    	        	//10月
		    	        	var old_10 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: p});
		    	        	//11月
		    	        	var old_11 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: p});
		    	        	//12月
		    	        	var old_12 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: p});
		    	        	//1月
		    	        	var old_1 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: p});
		    	        	//2月
		    	        	var old_2 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: p});
		    	        	//3月
		    	        	var old_3 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: p});
		    	        	//4月
		    	        	var old_4 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: p});
		    	        	//5月
		    	        	var old_5 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: p});
		    	        	//6月
		    	        	var old_6 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: p});
		    	        	//7月
		    	        	var old_7 = oldRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: p});
		    	        	//Q1
		    	        	var old_q1 = Number(old_8) +  Number(old_9) + Number(old_10);
		    	        	//Q2
		    	        	var old_q2 = Number(old_11) + Number(old_12) + Number(old_1);
		    	        	//Q3
		    	        	var old_q3 = Number(old_2) +  Number(old_3) + Number(old_4);
		    	        	//Q4
		    	        	var old_q4 = Number(old_5) +  Number(old_6) + Number(old_7);
		    	        	
	 		                var ValueArr = new Array();
	 		                ValueArr.push([old_8],[old_9],[old_10],[old_11],[old_12],[old_1],[old_2],[old_3],[old_4],[old_5],[old_6],[old_7]);
	 		                infoDic[budgetId] = new Array();
	 		                infoDic[budgetId].push(ValueArr);
		    	        	
				    	}
				    }
				}
				
				
			    //NS_予算ID
			    var budgetIdArr = currentRecord.getValue({fieldId : 'custrecord_ns_policy_budget_id'});
			    if(!isEmpty(budgetIdArr)){
			    	var budgetValue = budgetIdArr.split(',');
			    	//NS_予算_新規 検索
		    		var searchType = "customrecord_ringi_budget_new";
		    		var searchFilters = [];
		    		searchFilters.push(["internalid",'anyof',budgetValue]);
	    		    var searchColumns = [search.createColumn({
	    	            name : "custrecord_ns_new_budget_8_residual",
	    	            label : "8月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_9_residual",
	    	            label : "9月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_10_residual",
	    	            label : "10月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_11_residual",
	    	            label : "11月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_12_residual",
	    	            label : "12月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_1_residual",
	    	            label : "1月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_2_residual",
	    	            label : "2月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_3_residual",
	    	            label : "3月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_4_residual",
	    	            label : "4月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_5_residual",
	    	            label : "5月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_6_residual",
	    	            label : "6月予算残額"
	    		    }),search.createColumn({
	    	            name : "custrecord_ns_new_budget_7_residual",
	    	            label : "7月予算残額"
	    		    }),search.createColumn({
	    	            name : "internalid",
	    	            label : "内部ID"
	    		    })];
	    		    var searchResults = createSearch(searchType, searchFilters, searchColumns);
	    		    if (searchResults && searchResults.length > 0) {
	    		    	 var valueArr = {};
	    		    	 for (var i = 0; i < searchResults.length; i++) {
	    		    		 var tmpResult = searchResults[i];
	    		    		 var augAmount = tmpResult.getValue(searchColumns[0]);//8月予算残額
	    		    		 var sepAmount = tmpResult.getValue(searchColumns[1]);//9月予算残額
	    		    		 var octAmount = tmpResult.getValue(searchColumns[2]);//10月予算残額
	    		    		 var novAmount = tmpResult.getValue(searchColumns[3]);//11月予算残額
	    		    		 var decAmount = tmpResult.getValue(searchColumns[4]);//12月予算残額
	    		    		 var janAmount = tmpResult.getValue(searchColumns[5]);//1月予算残額
	    		    		 var febAmount = tmpResult.getValue(searchColumns[6]);//2月予算残額
	    		    		 var marAmount = tmpResult.getValue(searchColumns[7]);//3月予算残額
	    		    		 var aprAmount = tmpResult.getValue(searchColumns[8]);//4月予算残額
	    		    		 var mayAmount = tmpResult.getValue(searchColumns[9]);//5月予算残額
	    		    		 var junAmount = tmpResult.getValue(searchColumns[10]);//6月予算残額
	    		    		 var julAmount = tmpResult.getValue(searchColumns[11]);//7月予算残額 
	    		    		 var key = tmpResult.getValue(searchColumns[12]);//内部ID
	    		    		 
	    		    		 var residueAmount = infoDic[key];
			    			 if(!isEmpty(residueAmount)){
			    					var	augValue = residueAmount[0][0][0];//8月残額
			    					var	sepValue = residueAmount[0][1][0];//9月残額
			    					var	octValue = residueAmount[0][2][0];//10月残額
			    					var	novValue = residueAmount[0][3][0];//11月残額
			    					var	decValue = residueAmount[0][4][0];//12月残額
			    					var	janValue = residueAmount[0][5][0];//1月残額
			    					var	febValue = residueAmount[0][6][0];//2月残額
			    					var	marValue = residueAmount[0][7][0];//3月残額
			    					var	aprValue = residueAmount[0][8][0];//4月残額
			    					var	mayValue = residueAmount[0][9][0];//5月残額
			    					var	junValue = residueAmount[0][10][0];//6月残額
			    					var	julValue = residueAmount[0][11][0];//7月残額
			    					
			    					var newAugValue = Number(augValue) + Number(augAmount);//新8月予算残額
			    					var newSepValue = Number(sepValue) + Number(sepAmount);//新9月予算残額
			    					var newOctValue = Number(octValue) + Number(octAmount);//新10月予算残額
			    					var newNovValue = Number(novValue) + Number(novAmount);//新11月予算残額
			    					var newDecValue = Number(decValue) + Number(decAmount);//新12月予算残額
			    					var newJanValue = Number(janValue) + Number(janAmount);//新1月予算残額
			    					var newFebValue = Number(febValue) + Number(febAmount);//新2月予算残額
			    					var newMarValue = Number(marValue) + Number(marAmount);//新3月予算残額
			    					var newAprValue = Number(aprValue) + Number(aprAmount);//新4月予算残額
			    					var newMayValue = Number(mayValue) + Number(mayAmount);//新5月予算残額
			    					var newJunValue = Number(junValue) + Number(junAmount);//新6月予算残額
			    					var newJulValue = Number(julValue) + Number(julAmount);//新7月予算残額  		
			    			 }else{
			    					var newAugValue = Number(augAmount);//新8月予算残額
			    					var newSepValue = Number(sepAmount);//新9月予算残額
			    					var newOctValue = Number(octAmount);//新10月予算残額
			    					var newNovValue = Number(novAmount);//新11月予算残額
			    					var newDecValue = Number(decAmount);//新12月予算残額
			    					var newJanValue = Number(janAmount);//新1月予算残額
			    					var newFebValue = Number(febAmount);//新2月予算残額
			    					var newMarValue = Number(marAmount);//新3月予算残額
			    					var newAprValue = Number(aprAmount);//新4月予算残額
			    					var newMayValue = Number(mayAmount);//新5月予算残額
			    					var newJunValue = Number(junAmount);//新6月予算残額
			    					var newJulValue = Number(julAmount);//新7月予算残額  	
			    			 }
			    			 
			    			 
//		        				alert(key)
			    			 
	 		                 var MouthValueArr = new Array();
	 		                 MouthValueArr.push([newAugValue],[newSepValue],[newOctValue],[newNovValue],[newDecValue],[newJanValue],[newFebValue],[newMarValue],[newAprValue],[newMayValue],[newJunValue],[newJulValue]);
	 		                 valueArr[key] = new Array();
	 		                 valueArr[key].push(MouthValueArr); 
	    		    	 }
	    		    }
			    }	
				
			    var policyLine = currentRecord.getLineCount('recmachcustrecord_ns_policy_screen');
				var generalMessage = '';//通常
				var compenMessage = '';//減価償却
				for(var i = 0 ; i < policyLine ; i++){
			    	//NS_予算
		        	var budgetId = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',line: i});
		        	//8月
		        	var augAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
		        	//9月
		        	var sepAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
		        	//10月
		        	var octAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
		        	//11月
		        	var novAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
		        	//12月
		        	var decAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
		        	//1月
		        	var janAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
		        	//2月
		        	var febAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
		        	//3月
		        	var marAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
		        	//4月
		        	var aprAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
		        	//5月
		        	var mayAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
		        	//6月
		        	var junAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
		        	//7月
		        	var julAmount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
		        	//来期以降総額
		        	var mounth = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_amount',line: i});
		        	//取得金額
		        	var amount = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_money',line: i});
		        	//NS_稟議リスト
		        	var policyList = currentRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_list',line: i});
		        	//現在のq 1
	    			var q1Amount = Number(augAmount) + Number(sepAmount) + Number(octAmount);
	    			//現在のq 2
	    			var q2Amount = Number(novAmount) + Number(decAmount) + Number(janAmount);
	    			//現在のq 3
	    			var q3Amount = Number(febAmount) + Number(marAmount) + Number(aprAmount);
	    			//現在のq 4
	    			var q4Amount = Number(mayAmount) + Number(junAmount) + Number(julAmount);
	    			//現在の金額
	    			var totalValue = Number(augAmount)+Number(sepAmount)+Number(octAmount)+Number(novAmount)+Number(decAmount)+Number(janAmount)+Number(febAmount)+Number(marAmount)+Number(aprAmount)+Number(mayAmount)+Number(junAmount)+Number(julAmount);
	    			//NS_予算_新規 残額 
	    			var residueAmount = valueArr[budgetId];
	    			
	    			if(!isEmpty(residueAmount)){
						var	augValue = residueAmount[0][0][0];//8月予算残額
						var	sepValue = residueAmount[0][1][0];//9月予算残額
						var	octValue = residueAmount[0][2][0];//10月予算残額
						var	novValue = residueAmount[0][3][0];//11月予算残額						
						var	decValue = residueAmount[0][4][0];//12月予算残額
						var	janValue = residueAmount[0][5][0];//1月予算残額
						var	febValue = residueAmount[0][6][0];//2月予算残額
						var	marValue = residueAmount[0][7][0];//3月予算残額
						var	aprValue = residueAmount[0][8][0];//4月予算残額
						var	mayValue = residueAmount[0][9][0];//5月予算残額
						var	junValue = residueAmount[0][10][0];//6月予算残額
						var	julValue = residueAmount[0][11][0];//7月予算残額
						var	q1Value = Number(augValue) + Number(sepValue) + Number(octValue);//Q1予算残額 
						var	q2Value = Number(novValue) + Number(decValue) + Number(janValue);//Q2予算残額 
						var	q3Value = Number(febValue) + Number(marValue) + Number(aprValue);//Q3予算残額 
						var	q4Value = Number(mayValue) + Number(junValue) + Number(julValue);//Q4予算残額 
	    			}        		
	    			
	    			
					if(policyList == '1'){
	    				if(Number(q1Amount) > Number(q1Value)){
	    					generalMessage += i+1+"行目がQ1予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(q2Amount) > Number(q2Value)){
	    					generalMessage += i+1+"行目がQ2予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(q3Amount) > Number(q3Value)){
	    					generalMessage += i+1+"行目がQ3予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(q4Amount) > Number(q4Value)){
	    					generalMessage += i+1+"行目がQ4予算を超えています。再入力してください。"+'\n';
	    				}  
					}else if(policyList == '3'){
						var getAmount = totalValue + Number(mounth);
	    				if(Number(getAmount) > Number(amount)){
	    					compenMessage += i+1+"行目が今期＋来期以降総額は取得金額以下でなければなりません。"+'\n';
	    				}     
	    				if(Number(augAmount) > Number(augValue)){
	    					compenMessage += i+1+"行目が8月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(sepAmount) > Number(sepValue)){
	    					compenMessage += i+1+"行目が9月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(octAmount) > Number(octValue)){
	    					compenMessage += i+1+"行目が10月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(novAmount) > Number(novValue)){
	    					compenMessage += i+1+"行目が11月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(decAmount) > Number(decValue)){
	    					compenMessage += i+1+"行目が12月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(janAmount) > Number(janValue)){
	    					compenMessage += i+1+"行目が1月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(febAmount) > Number(febValue)){
	    					compenMessage += i+1+"行目が2月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(marAmount) > Number(marValue)){
	    					compenMessage += i+1+"行目が3月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(aprAmount) > Number(aprValue)){
	    					compenMessage += i+1+"行目が4月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(mayAmount) > Number(mayValue)){
	    					compenMessage += i+1+"行目が5月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(junAmount) > Number(junValue)){
	    					compenMessage += i+1+"行目が6月予算を超えています。再入力してください。"+'\n';
	    				}
	    				if(Number(julAmount) > Number(julValue)){
	    					compenMessage += i+1+"行目が7月予算を超えています。再入力してください。"+'\n';
	    				}
					}
	    			
				} 
			    
				
				var errorMessage = '';
				if(!isEmpty(compenMessage) || !isEmpty(generalMessage)){
					errorMessage = (compenMessage+ "" + generalMessage)
				}
				var retrunFlg = true;
				if(!isEmpty(errorMessage)){
					alert(errorMessage);
					retrunFlg = false;
					return false;
				}else{
					
					if(retrunFlg){
						budgetReduction(null,oldPolicyId);
						if (oldPolicyId) {
							// 施策運用稟議画面-月別稟議額-DELETE
							var getPolicyScreenMonthIdAry = getPolicyScreenMonthId(oldPolicyId);
							if(getPolicyScreenMonthIdAry && getPolicyScreenMonthIdAry.length > 0){
					        	for(var i = 0; i < getPolicyScreenMonthIdAry.length; i++){
					        		var internalid = getPolicyScreenMonthIdAry[i].getValue({name: "internalid", label: "内部ID"});
					        		record.delete({
										type: "customrecord_ns_policy_screen_month",
										id: internalid
									});
					        	}
					        	// 仮データ削除
					        	record.delete({
									type: "customrecord_ns_policy_screen",
									id: oldPolicyId
								});
					        }
						}
						currentRecord.setValue({fieldId : 'custrecord_ns_policy_resubmit_process',	value : true,ignoreFieldChange : true });	
						currentRecord.save();
					}
					
				}
				window.ischanged = false;
				window.location.href=window.location.href;
			}
		}catch(e){
			alert(e)
		}
	}
	
	
    function budgetReduction(policyRecord,policyId) {
    	// line ID
    	var sublistId = 'recmachcustrecord_ns_policy_screen';
    	log.debug("policyId",policyId)
    	if(!isEmpty(policyId)){
    		//施策運用稟議画面
    		if(isEmpty(policyRecord)){
            	policyRecord = record.load({type : 'customrecord_ns_policy_screen',id : policyId});
    		}
        	var headerBudId =  policyRecord.getValue({fieldId: 'custrecord_ns_policy_budget_id'});
        	if(!isEmpty(headerBudId)){
            	var budgetValue = headerBudId.split(',');
    			var searchType = "customrecord_ringi_budget_new";
    			var searchFilters = [];
    			searchFilters.push(["internalid",'anyof',budgetValue]);
    		    var searchColumns = [search.createColumn({
    	            name : "custrecord_ns_new_budget_8_residual",
    	            label : "8月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_9_residual",
    	            label : "9月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_10_residual",
    	            label : "10月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_11_residual",
    	            label : "11月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_12_residual",
    	            label : "12月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_1_residual",
    	            label : "1月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_2_residual",
    	            label : "2月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_3_residual",
    	            label : "3月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_4_residual",
    	            label : "4月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_5_residual",
    	            label : "5月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_6_residual",
    	            label : "6月予算残額"
    		    }),search.createColumn({
    	            name : "custrecord_ns_new_budget_7_residual",
    	            label : "7月予算残額"
    		    }),search.createColumn({
    	            name : "internalid",
    	            label : "内部ID"
    		    })];
    		    var searchResults = createSearch(searchType, searchFilters, searchColumns);
    		    if (searchResults && searchResults.length > 0) {
    		    	 var infoDic = {};
    		    	 for (var i = 0; i < searchResults.length; i++) {
    		    		 var tmpResult = searchResults[i];
    		    		 var augAmount = tmpResult.getValue(searchColumns[0]);//8月予算残額
    		    		 var sepAmount = tmpResult.getValue(searchColumns[1]);//9月予算残額
    		    		 var octAmount = tmpResult.getValue(searchColumns[2]);//10月予算残額
    		    		 var novAmount = tmpResult.getValue(searchColumns[3]);//11月予算残額
    		    		 var decAmount = tmpResult.getValue(searchColumns[4]);//12月予算残額
    		    		 var janAmount = tmpResult.getValue(searchColumns[5]);//1月予算残額
    		    		 var febAmount = tmpResult.getValue(searchColumns[6]);//2月予算残額
    		    		 var marAmount = tmpResult.getValue(searchColumns[7]);//3月予算残額
    		    		 var aprAmount = tmpResult.getValue(searchColumns[8]);//4月予算残額
    		    		 var mayAmount = tmpResult.getValue(searchColumns[9]);//5月予算残額
    		    		 var junAmount = tmpResult.getValue(searchColumns[10]);//6月予算残額
    		    		 var julAmount = tmpResult.getValue(searchColumns[11]);//7月予算残額 
    		    		 var key = tmpResult.getValue(searchColumns[12]);//内部ID
    		    		 
 		                 var ValueArr = new Array();
 		                 ValueArr.push([augAmount],[sepAmount],[octAmount],[novAmount],[decAmount],[janAmount],[febAmount],[marAmount],[aprAmount],[mayAmount],[junAmount],[julAmount]);
 		                 infoDic[key] = new Array();
 		                 infoDic[key].push(ValueArr);
    		    	}
    		    }
        	}   	
	    	var policyLine = policyRecord.getLineCount({sublistId: sublistId});
	    	for(var i = 0; i < policyLine; i++) {
		    	//NS_予算
	        	var budgetId = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_budget',line: i});
	        	//8月
	        	var augAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_aug',line: i});
	        	//9月
	        	var sepAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_sep',line: i});
	        	//10月
	        	var octAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_oct',line: i});
	        	//11月
	        	var novAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_nov',line: i});
	        	//12月
	        	var decAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_dec',line: i});
	        	//1月
	        	var janAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jan',line: i});
	        	//2月
	        	var febAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_feb',line: i});
	        	//3月
	        	var marAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_mar',line: i});
	        	//4月
	        	var aprAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_apr',line: i});
	        	//5月
	        	var mayAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_may',line: i});
	        	//6月
	        	var junAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jun',line: i});
	        	//7月
	        	var julAmount = policyRecord.getSublistValue({sublistId: 'recmachcustrecord_ns_policy_screen',fieldId: 'custrecord_ns_policy_month_jul',line: i});
	        	var residueAmount = infoDic[budgetId]; //残額 
				if(!isEmpty(residueAmount)){
					var	augValue = residueAmount[0][0][0];//原8月予算残額
					var	sepValue = residueAmount[0][1][0];//原9月予算残額
					var	octValue = residueAmount[0][2][0];//原10月予算残額
					var	novValue = residueAmount[0][3][0];//原11月予算残額
					var	decValue = residueAmount[0][4][0];//原12月予算残額
					var	janValue = residueAmount[0][5][0];//原1月予算残額
					var	febValue = residueAmount[0][6][0];//原2月予算残額
					var	marValue = residueAmount[0][7][0];//原3月予算残額
					var	aprValue = residueAmount[0][8][0];//原4月予算残額
					var	mayValue = residueAmount[0][9][0];//原5月予算残額
					var	junValue = residueAmount[0][10][0];//原6月予算残額
					var	julValue = residueAmount[0][11][0];//原7月予算残額
					
			
					var newAugValue = Number(augValue) + Number(augAmount);//新8月予算残額
					var newSepValue = Number(sepValue) + Number(sepAmount);//新9月予算残額
					var newOctValue = Number(octValue) + Number(octAmount);//新10月予算残額
					var newNovValue = Number(novValue) + Number(novAmount);//新11月予算残額
					var newDecValue = Number(decValue) + Number(decAmount);//新12月予算残額
					var newJanValue = Number(janValue) + Number(janAmount);//新1月予算残額
					var newFebValue = Number(febValue) + Number(febAmount);//新2月予算残額
					var newMarValue = Number(marValue) + Number(marAmount);//新3月予算残額
					var newAprValue = Number(aprValue) + Number(aprAmount);//新4月予算残額
					var newMayValue = Number(mayValue) + Number(mayAmount);//新5月予算残額
					var newJunValue = Number(junValue) + Number(junAmount);//新6月予算残額
					var newJulValue = Number(julValue) + Number(julAmount);//新7月予算残額  
				}
				//更新8月予算残額
				if(!isEmpty(newAugValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_8_residual': newAugValue}});
				} 					
				//更新9月予算残額
				if(!isEmpty(newSepValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_9_residual': newSepValue}});
				}
				//更新10月予算残額
				if(!isEmpty(newOctValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_10_residual': newOctValue}});
				}
				//更新11月予算残額
				if(!isEmpty(newNovValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_11_residual': newNovValue}});
				}
				//更新12月予算残額
				if(!isEmpty(newDecValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_12_residual': newDecValue}});
				}
				//更新1月予算残額
				if(!isEmpty(newJanValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_1_residual': newJanValue}});
				}
				//更新2月予算残額
				if(!isEmpty(newFebValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_2_residual': newFebValue}});
				}
				//更新3月予算残額
				if(!isEmpty(newMarValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_3_residual': newMarValue}});
				}
				//更新4月予算残額
				if(!isEmpty(newAprValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_4_residual': newAprValue}});
				}
				//更新5月予算残額
				if(!isEmpty(newMayValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_5_residual': newMayValue}});
				}
				//更新6月予算残額
				if(!isEmpty(newJunValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_6_residual': newJunValue}});
				}
				//更新7月予算残額
				if(!isEmpty(newJulValue)){
	           			 record.submitFields({type: 'customrecord_ringi_budget_new',id: budgetId,values: {'custrecord_ns_new_budget_7_residual': newJulValue}});
				}
	    	}
    	}
    }
	
	
	 function createSearch(searchType, searchFilters, searchColumns) {

	        var resultList = [];
	        var resultIndex = 0;
	        var resultStep = 1000;

	        var objSearch = search.create({
	            type : searchType,
	            filters : searchFilters,
	            columns : searchColumns
	        });
	        var objResultSet = objSearch.run();

	        do {
	            var results = objResultSet.getRange({
	                start : resultIndex,
	                end : resultIndex + resultStep
	            });

	            if (results.length > 0) {
	                resultList = resultList.concat(results);
	                resultIndex = resultIndex + resultStep;
	            }
	        } while (results.length == 1000);

	        return resultList;
	    }
	
	 function unique1(arr){
		  var hash=[];
		  for (var i = 0; i < arr.length; i++) {
		     if(hash.indexOf(arr[i])==-1){
		      hash.push(arr[i]);
		     }
		  }
		  return hash;
	}
	 //20230803 add by zhou start
	 //クローズ機能
	function updateClose(id){
		try{ 
		    var curRecord = record.load({
			    type: 'customrecord_ns_policy_screen',
			    id: id,
			    isDynamic: true
			});
		    var closeType = curRecord.getValue({
				fieldId: 'custrecord_ns_policy_checkbox',
			});
		    console.log(closeType)
		    if(closeType == false){
		    	var batchLink = url.resolveScript({ 
					scriptId: 'customscript_djkk_sl_scheduled_running', 
					deploymentId: 'customdeploy_djkk_sl_scheduled_running', 
				    params: {
				    	'customscriptId' :'customscript_ss_policy_paa',
						'customdeployId' :'customdeploy_ss_policy_paa',
						'paramsId' :'custscript_ns_psid',
						'paramsData' :id
                    },
		    		returnExternalUrl : false
					}); 
		    	var rse = http.get.promise({ url: batchLink }); 
		    }else{
		    	alert('現在の施策運用稟議画面ではシャットダウン操作が行われていますので、再起動しないでください')
		    	return false;
		    }
		}catch(e){
			console.log(e)
		}		
		alert('クローズ操作を開始します。')
		sleep('5000')
		window.ischanged = false;
		window.location.href=window.location.href;
		return true;	
	}
	
	/**
     * sleep
     */
    function sleep(waitMsec) {
        var startMsec = new Date();

        while (new Date() - startMsec < waitMsec);
    }
	//20230803 add by zhou end
    
    
    function cancle(id){
    	try{
        	if(!isEmpty(id)){
        		var sublistId = "recmachcustrecord_ns_policy_screen"
        	    var policyRecord = record.load({type: 'customrecord_ns_policy_screen',id: id,isDynamic: true});
        	    //仮データ関連  
        	    var kariId = policyRecord.getValue({fieldId:'custrecord_ns_policy_sm_create_kari_id'});
        	    if(!isEmpty(kariId)){
        	    	//Old データ
        			var newRec = record.load({type : 'customrecord_ns_policy_screen',id : kariId,});
        			// Now データ
        			var oldRec = record.load({type : 'customrecord_ns_policy_screen',id : id,});
        			
        	    	var sublistJson = getSublistValueToJson(newRec);
        	    	var headerFieldAry = headerFieldId();
        	    	
        	    	var fieldAry = sublistFieldId();
        	    	
        	    	// 仮データ現在のデータを上書き（ヘーダ）
        	    	for (var i = 0; i < headerFieldAry.length; i++) {
        	    		if(headerFieldAry[i] == 'custrecord_ns_policy_file_name'){
        	    			var value = newRec.getValue({fieldId : headerFieldAry[i]});
        	    			oldRec.setValue({fieldId : headerFieldAry[i], value : value.replace('(仮)','')});
        	    		}else if(headerFieldAry[i] == 'custrecord_ns_policy_sm_create_kari_id'){
        	    			oldRec.setValue({fieldId : headerFieldAry[i], value : ''});
        	    		}else{
        	    			oldRec.setValue({fieldId : headerFieldAry[i], value : newRec.getValue({fieldId : headerFieldAry[i]})});
        	    		}
        			}
        	    	oldRec.setValue({fieldId: "isinactive", value: false});
        	    	
        	    	//Old データ  Line
        	    	var oldlinecount = oldRec.getLineCount({sublistId: sublistId});
        	    	
        	    	// 仮データ現在のデータを上書き（ライン）
        	    	for(var x = 0; x < oldlinecount; x++) {
        	    		for (var y = 0; y < fieldAry.length; y++) {
        	    			var newDataValue = newRec.getSublistValue({
        	    				sublistId: sublistId,
        	    				fieldId: fieldAry[y],
        	    				line: x
        	    			});
        	    			oldRec.setSublistValue({
        	    				sublistId: sublistId,
        	                    fieldId: fieldAry[y],
        	                    value: newDataValue,
        	                    line: x
        	    			});
        	    		}
        	    	}
        			//save 
        			oldRec.save({enableSourcing: false, ignoreMandatoryFields: true});
        	    	// 施策運用稟議画面-月別稟議額-DELETE
        			var getPolicyScreenMonthIdAry = getPolicyScreenMonthId(kariId);
        			if(getPolicyScreenMonthIdAry && getPolicyScreenMonthIdAry.length > 0){
        	        	for(var i = 0; i < getPolicyScreenMonthIdAry.length; i++){
        	        		var internalid = getPolicyScreenMonthIdAry[i].getValue({name: "internalid", label: "内部ID"});
        	        		record.delete({
        						type: "customrecord_ns_policy_screen_month",
        						id: internalid
        					});
        	        	}
        	        	// 仮データ削除
        	        	record.delete({
        					type: "customrecord_ns_policy_screen",
        					id: kariId
        				});
        	        }
        			//最終承認済み
        			record.submitFields({type: 'customrecord_ns_policy_screen',id: id,values: {'custrecord_ns_policy_status': 4}});
        			//仮データ関連 = ''
        			record.submitFields({type: 'customrecord_ns_policy_screen',id: id,values: {'custrecord_ns_policy_sm_create_kari_id': ''}});
        			
    				window.ischanged = false;
    				window.location.href=window.location.href;
        	    }
        	}
    	}catch(e){
    		alert(e);
    	}
    	
    }
    
    function deleteFun(id){
    	try{
        	if(!isEmpty(id)){
        	    var policyRecord = record.load({type: 'customrecord_ns_policy_screen',id: id,isDynamic: true});
        		var sublistId = "recmachcustrecord_ns_policy_screen"
        	    var linecount = policyRecord.getLineCount({sublistId: sublistId});
        		for(var x = 0; x < linecount; x++) {
        			var internalid = policyRecord.getSublistValue({sublistId: sublistId,fieldId: 'id',line: x});
        			if(!isEmpty(internalid)){
    	        		record.delete({
    						type: "customrecord_ns_policy_screen_month",
    						id: internalid
    					});
        			}
        		}
        		record.delete({
    				type: "customrecord_ns_policy_screen",
    				id: id
    			});
    			window.ischanged = false;
    			window.location.href=window.location.href;
        	}
    	}catch(e){
			alert(e);
		}
    }
    
    
    function getSublistValueToJson(newRec){
    	var returnJson = {};
    	var sublistId = 'recmachcustrecord_ns_policy_screen';
    	var fieldAry = sublistFieldId();
    	var sublistCounts = newRec.getLineCount({sublistId:sublistId});
		if(sublistCounts && sublistCounts > 0){
			for (var linenum = 0; linenum < sublistCounts; linenum++){
				var dataAry = {};
				for (var i = 0; i < fieldAry.length; i++) {
					var fieldId = fieldAry[i];
					dataAry[fieldId] = newRec.getSublistValue({sublistId:sublistId, fieldId:fieldId, line:linenum});
				}
				returnJson[linenum] = dataAry;
			}
		}
		return returnJson;
    }
    
    // Header Field 
    function headerFieldId(){
    	var headerFieldAry = ['custrecord_ns_policy_no',
    	                      'custrecord_ns_policy_file_name',
    	                      'custrecord_ns_policy_cancel_message',
    	                      'custrecord_ns_policy_cancel_budget_year',
//    	                      'custrecord_ns_policy_department',
//    	                      'custrecord_ns_policy_departmentid',
    	                      'custrecord_ns_policy_amount',
    	                      'custrecord_ns_policy_residual_amount',
    	                      'custrecord_ns_policy_residual_amount_vb',
    	                      'custrecord_ns_policy_hacchuugaku',
    	                      'custrecord_ns_policy_creator',
    	                      'custrecord_ns_policy_memo',
    	                      'custrecord_ns_policy_desired_date',
    	                      'custrecord_ns_policy_expected_po_date',
    	                      'custrecord_ns_policy_siharaigaku',
    	                      'custrecord_ns_policy_budget_id',
    	                      'custrecord_ns_policy_checkbox',
    	                      'custrecord_ns_policy_type',
    	                      'custrecord_ns_policy_budget_department',
    	                      'custrecord_ns_policy_division',
    	                      'custrecord_ns_policy_message',
    	                      'custrecord_ns_policy_status',
//    	                      'custrecord_ns_policy_req_user',
//    	                      'custrecord_ns_policy_req_roll',
//    	                      'custrecord_ns_policy_date',
//    	                      'custrecord_ns_policy_req_shokui',
//    	                      'custrecord_ns_policy_sm_role_of_req_role',
//    	                      'custrecord_ns_policy_app_role_of_reqrole',
//    	                      'custrecord_ns_policy_rep_divmanager',
//    	                      'custrecord_ns_policy_req_exectiveofficer',
//    	                      'custrecord_ns_policy_req_president',
//    	                      'custrecord_ns_policy_tl_user',
//    	                      'custrecord_ns_policy_tl_date',
//    	                      'custrecord_ns_policy_app_user',
//    	                      'custrecord_ns_policy_app_user_date',
//    	                      'custrecord_ns_policy_divmanager_user',
//    	                      'custrecord_ns_policy_divmanager_date',
//    	                      'custrecord_ns_polic_exectiveofficer_user',
//    	                      'custrecord_ns_polic_exectiveofficer_date',
//    	                      'custrecord_ns_policy_president_user',
//    	                      'custrecord_ns_policy_president_date',
//    	                      'custrecord_ns_policy_tl_app_st',
//    	                      'custrecord_ns_policy_butyou_app_st',
//    	                      'custrecord_ns_policy_divmanager_app_st',
//    	                      'custrecord_ns_policy_exectiveofficer_ast',
//    	                      'custrecord_ns_policy_president_app_st',
//    	                      'custrecord_ns_policy_reject_user',
//    	                      'custrecord_ns_policy_reject_time',
//    	                      'custrecord_ns_policy_reject_role',
//    	                      'custrecord_ns_policy_submit_dep',
//    	                      'custrecord_ns_policy_ringi_tl_skip_flg',
//    	                      'custrecord_ns_policy_ringi_managerskpflg',
//    	                      'custrecord_ns_policy_ringi_divmanagerskp',
//    	                      'custrecord_ns_policy_ringi_lastapp_role',
    	                      'custrecord_ns_policy_ringi_cancel_flg',
    	                      'custrecord_ns_policy_sm_create_kari_id',
    	                      'custrecord_ns_policy__ringi_torilesi_exe',
    	                      'custrecord_ns_policy_resubmit_process',
    	                      'custrecord_ns_policy_ringirecord_count',
    	                      'custrecord_ns_policy_ringirecord_reason',
    	                      'custrecord_ns_policy_created_date',
    	                      'custrecord_ns_policy_create_date_yy',
    	                      'custrecord_ns_policy_create_month',
    	                      'custrecord_ns_policy_current_quarter',
    	                      'custrecord_ns_policy_create_date_dd',
    	                      'custrecord_ns_policy_sub'];
    	return headerFieldAry;
    }
    
    // Line Field 
    function sublistFieldId(){
    	var fieldAry = ['custrecord_ns_policy_month_budget',
    	    			'custrecord_ns_policy_month_project',
    	    			'custrecord_ns_policy_month_measures',
    	    			'custrecord_ns_policy_month_area',
    	    			'custrecord_ns_policy_month_brand',
    	    			'custrecord_ns_policy_month_list',
    	    			'custrecord_ns_policy_month_account',
    	    			'custrecord_ns_policy_month_aug',
    	    			'custrecord_ns_policy_month_8_residual',
    	    			'custrecord_ns_policy_month_sep',
    	    			'custrecord_ns_policy_month_9_residual',
    	    			'custrecord_ns_policy_month_oct',
    	    			'custrecord_ns_policy_month_10_residual',
    	    			'custrecord_ns_policy_month_nov',
    	    			'custrecord_ns_policy_month_11_residual',
    	    			'custrecord_ns_policy_month_dec',
    	    			'custrecord_ns_policy_month_12_residual',
    	    			'custrecord_ns_policy_month_jan',
    	    			'custrecord_ns_policy_month_1_residual',
    	    			'custrecord_ns_policy_month_feb',
    	    			'custrecord_ns_policy_month_2_residual',
    	    			'custrecord_ns_policy_month_mar',
    	    			'custrecord_ns_policy_month_3_residual',
    	    			'custrecord_ns_policy_month_apr',
    	    			'custrecord_ns_policy_month_4_residual',
    	    			'custrecord_ns_policy_month_may',
    	    			'custrecord_ns_policy_month_5_residual',
    	    			'custrecord_ns_policy_month_jun',
    	    			'custrecord_ns_policy_month_6_residual',
    	    			'custrecord_ns_policy_month_jul',
    	    			'custrecord_ns_policy_month_7_residual',
    	    			'custrecord_ns_policy_month_amount',
    	    			'custrecord_ns_policy_month_total',
    	    			'custrecord_ns_policy_month_money',
    	    			'custrecord_ns_policy_screen'];
    	return fieldAry;
    }
    
    function getAllResults(mySearch){
		var resultSet = mySearch.run();
		var resultArr= [];
		var start = 0;
		var step  = 1000;
		var results = resultSet.getRange({
      	    start: start, 
      	    end: step
      	});
		while(results && results.length>0)
		{
			resultArr = resultArr.concat(results);
			start = Number(start)+Number(step); 
			results = resultSet.getRange({
				start: start,
				end: Number(start)+Number(step)
				});
		}
		return resultArr;
	}
    
    /**
     * 施策運用稟議画面対応サブテーブルID取得
     * revisionId  施策運用稟議画面内部ID
     */
    function getPolicyScreenMonthId(revisionId){
    	var searchObj = search.create({
			   type: "customrecord_ns_policy_screen_month",
			   filters:
			   [
			      ["custrecord_ns_policy_screen","ANYOF",revisionId], 
			      "AND", 
			      ["isinactive","is","F"]
			   ],
			   columns:
			   [
			      search.createColumn({name: "internalid", label: "内部ID"})
			   ]
			});

		return getAllResults(searchObj);
    }
    
    
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        returnRenew:returnRenew,
        updateClose:updateClose,
        cancle:cancle,
        deleteFun:deleteFun,
        appleFun:appleFun,
//        lineInit: lineInit,
//        validateField: validateField,
//        validateLine: validateLine,
//        validateInsert: validateInsert,
//        validateDelete: validateDelete,
        saveRecord: saveRecord
    };
    
});
