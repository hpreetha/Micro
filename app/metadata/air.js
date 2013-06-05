module.exports = {
	template : "templates/AIR.html",
	title : "Accident/ Incident Report Form",
	tabs : [{
		'name' : 'Customer',
		'id' : 'airCustomerPart',
		'target' : 'airCustomerTab',
		'steps' : ["customerDetails", "accident_details", "otherDetails"],
	}, {
		'name' : 'Office',
		'id' : 'airOfficePart',
		'target' : 'airOfficeTab',
		'steps' : ["holidayAdvisorDet1", "holidayAdvisorDet2", "holidayAdvisorDet3"],
	}],
	//steps :
	mandatoryFields : {
		"customerDetails" : ["title", "surName", "bookingReference", "overseas_airport", "arrivalDate", "departureDate", "accom_name", "roomNumber"],
		"accident_details" : ["dateTookPlace", "timeTookPlace", "whatHpnd", "whereHpnd", "yourThoughts", "weatherCond"],
		"otherDetails" : ["customerSignature", "cusDate"],
		"holidayAdvisorDet1" : ["holidayAdvisoryName","inspectedDate","inspectedTime","causeOfIncident","stepRectify"],
		"holidayAdvisorDet2" : ["supplierAction","insurancecompAdvised","contactName","contactEmail"],
		"holidayAdvisorDet3" : ["supplierDate"]
	},
}