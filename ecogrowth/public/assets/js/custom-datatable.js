	
$(document).ready(function() {

	$('.dataTable').DataTable( {
		dom: 'lBfrtip',
		buttons: [
		'excel', 'print'
		],
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );

	var dataTableWithoutExport  = $('.dataTableWithoutExport').DataTable( {
		dom: 'lBfrtip',
		buttons: [
		],
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );


	$('.simpleDataTable').DataTable();

	
	$('#multifilterDataTable thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( table.column(i).search() !== this.value ) {
				table
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			table.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );
	
	var table = $('#multifilterDataTable').DataTable( {
		initComplete: function() {
			$('.buttons-colvis').html('<i class="fa fa-eye" />')
		},
		orderCellsTop: true,
		fixedHeader: true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
		dom: 'lBfrtip',
		buttons: [
		
		{
			extend: 'excelHtml5',
			text:      '<i class="fa fa-file-excel-o"></i>',
			titleAttr: 'Excel',
			exportOptions: {
				columns: ':visible'
			}
		},
		{
			extend: 'colvis',
			collectionLayout: 'fixed two-column'
		}
		]
	} );


	$('#editSubjectRoleForm').on('submit', function(e){
		var form = this;
		table.$('input[name="teacher_id[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.checked){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 



	$('#addWardForm').on('submit', function(e){
		var form = this;
		table.$('input[name="student[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.checked){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 

	$('#assignStudentForm').on('submit', function(e){
		var form = this;
		table.$('input[name="student[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.checked){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 
	$('#assignStudentRollNumberForm').on('submit', function(e){
		var form = this;
		table.$('input[name="student[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.val() != ""){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		});

		table.$('input[name="student_roll_no[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.val() != ""){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 

	$('#assignSubjectForm').on('submit', function(e){
		var form = this;
		table.$('input[name="subject[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.checked){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 

	$('#mark-attendance-form').on('submit', function(e){
		var form = this;
		table.$('input[name="student[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.checked){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 


	var table2 = $('#multifilterDataTableWithExport').DataTable( {
		dom: 'lBfrtip',
		buttons: [
		'excel', 'print',
		],
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );



	$('#multifilterDataTableWithExport thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( table2.column(i).search() !== this.value ) {
				table2
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			table2.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );
	
	
	var table3 = $('#multifilterDataTable1').DataTable( {
		orderCellsTop: true,
		fixedHeader: true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );

	$('#multifilterDataTable1 thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( table3.column(i).search() !== this.value ) {
				table3
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			table3.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );

	var table4 = $('#multifilterDataTable2').DataTable( {
		orderCellsTop: true,
		fixedHeader: true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );

	$('#multifilterDataTable2 thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( table4.column(i).search() !== this.value ) {
				table4
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			table4.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );
	
	
	$('#forwardSubjectRoleForm').on('submit', function(e){
		var form = this;
		table4.$('input[name="teacher_id[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.checked){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 


	var table5 = $('#multifilterDataTable3').DataTable( {
		orderCellsTop: true,
		fixedHeader: true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );

	$('#multifilterDataTable3 thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( table5.column(i).search() !== this.value ) {
				table5
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			table5.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );


	$('#approveSubjectRoleForm').on('submit', function(e){
		var form = this;
		table5.$('input[name="teacher_id[]"]').each(function(){
			if(!$.contains(document, this)){
				if(this.checked){
					$(form).append(
						$('<input>')
						.attr('type', 'hidden')
						.attr('name', this.name)
						.val(this.value)
						);
				}
			} 
		}); 
	}); 



	var table6 = $('#multifilterDataTable4').DataTable( {
		orderCellsTop: true,
		fixedHeader: true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );

	$('#multifilterDataTable4 thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( table6.column(i).search() !== this.value ) {
				table6
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			table6.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );


	var table7 = $('#multifilterDataTable5').DataTable( {
		orderCellsTop: true,
		fixedHeader: true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
	} );

	$('#multifilterDataTable5 thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( table7.column(i).search() !== this.value ) {
				table7
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			table7.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );
	


	$('#multifilterDataTable111 thead tr:eq(1) th').each( function (i) {
		if($(this).attr('class') == "searchable" && $(this).attr('id') == undefined){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control" placeholder="Search" />' );
		}else if($(this).attr('class') == "searchable" && $(this).attr('id') == "dob_th"){
			var title = $(this).text();
			$(this).html( '<input type="text" class="form-control date-picker1" placeholder="Search" />' );
		}
		$( 'input', this ).on( 'keyup change', function () {
			if ( tabless.column(i).search() !== this.value ) {
				tabless
				.column(i)
				.search( this.value )
				.draw();
			}
		} );
		$( 'select', this ).on( 'change', function () {
			var val = $.fn.dataTable.util.escapeRegex(
				$(this).val()
				);
			tabless.column(i)
			.search( val ? '^'+val+'$' : '', true, false )
			.draw();
		} );

	} );
	
	var tabless = $('#multifilterDataTable111').DataTable( {
		initComplete: function() {
			$('.buttons-colvis').html('<i class="fa fa-eye" />')
		},
		orderCellsTop: true,
		fixedHeader: true,
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
		dom: 'lBfrtip',
		buttons: [
		
		{
			extend: 'excelHtml5',
			text:      '<i class="fa fa-file-excel-o"></i>',
			titleAttr: 'Excel',
			exportOptions: {
				columns: ':visible'
			}
		},
		{
			extend: 'colvis',
			collectionLayout: 'fixed two-column'
		}
		],
		"columns": [
		null,
		null,
		null,
		{ "orderDataType": "dom-text-numeric" },
		null

		]
	} );


	$.fn.dataTable.ext.order['dom-text-numeric'] = function  ( settings, col )
	{
		return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
			return $('input', td).val() * 1;
		} );
	}
});