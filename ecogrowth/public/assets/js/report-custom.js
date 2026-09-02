function openLoanModal (id){
	$('#loanInputId').val(id);
	$('#loanInputValue').val($('#emp_load_'+id).text());
	$('#loanModal').modal('toggle');
}

function updateLoad(){
	var id = $('#loanInputId').val();
	var amount = $('#loanInputValue').val();
	$('#emp_load_'+id).text(amount);
	var net_pay = $('#net_pay_'+id).text();
	var updated_amount = parseInt(net_pay) - parseInt(amount);
	$('#net_pay_'+id).text(updated_amount);
	$('#loanModal').modal('toggle');
}



function fnExcelReport()
{
	var tab_text="<table border='2px'><tr bgcolor='#87AFC6'>";
	var textRange; var j=0;
    tab = document.getElementById('salaryTable'); // id of table

    for(j = 0 ; j < tab.rows.length ; j++) 
    {     
    	tab_text=tab_text+tab.rows[j].innerHTML+"</tr>";
        //tab_text=tab_text+"</tr>";
    }

    tab_text=tab_text+"</table>";
    tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
    tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
    tab_text= tab_text.replace(/<i[^>]*>|<\/i>/gi, ""); 
    tab_text= tab_text.replace(/<a[^>]*>|<\/a>/gi, ""); 
    tab_text= tab_text.replace(/<span[^>]*>|<\/span>/gi, ""); 
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE "); 

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    {
    	txtArea1.document.open("txt/html","replace");
    	txtArea1.document.write(tab_text);
    	txtArea1.document.close();
    	txtArea1.focus(); 
    	sa=txtArea1.document.execCommand("SaveAs",true,"Say Thanks to Sumit.xls");
    }  
    else                 //other browser not tested on IE 11
    	sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));  

    return (sa);

}
function showData(){
	if($('#from_date').val() == ""){
		swal('Oops','Please Select Date From','warning');
		return false;
	} else if($('#to_date').val() == ""){
		swal('Oops','Please Select Date To','warning');
		return false;
	}else{
		return true;
	}
}

function openOtherDeductionModal (id){
	$('#deductionInputId').val(id);
	$('#otherDeductionModal').modal('toggle');
}


function updateNetPay(){

	var id = $('#deductionInputId').val();
	var amount = $('#getDeductionType option:selected').val();

	if($('#other_deductions_'+id).text() == ""){
		$("#getDeductionType").find("option").eq(0).remove();
	}

	var amount = $("#getDeductionType option:selected").val();
	var html = `<tr><td>`+$("#getDeductionType option:selected").text()+`</td><td>`+amount+`</td></tr>`;
	var net_pay = $('#net_pay_'+id).text();
	var updated_amount = parseInt(net_pay) - parseInt(amount);
	$('#net_pay_'+id).text(updated_amount);
	$('#thead_'+id).show();
	$('#other_deductions_'+id).append(html);
	$('#otherDeductionModal').modal('toggle');
}

function removeFilter(){
	$('#emp_id').val('');
	$('#filterForm').submit();
}
$(document).ready(function() {
	$("#to_date").on('change',function () {
		var startDate = document.getElementById("from_date").value;
		var endDate = document.getElementById("to_date").value;
		if (endDate <= startDate) {
			alert("End date should be greater than Start date");
			document.getElementById("to_date").value = "";
		}
	});


});