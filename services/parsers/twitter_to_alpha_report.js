var logger = null

this.load = function(log) {
	logger = log
}

this.parse = function(raw_feed_object) {
	logger.debug("Attempting to parse raw_feed_object with id " + raw_feed_object._id);

	alpha_report_object = {};

	alpha_report_object.raw_data_id = raw_feed_object._id;
	alpha_report_object.source_name = raw_feed_object.feedSource;

	var object_text = text;
	var parsed_text = JSON.parse(object_text);

	alpha_report_object.message_date = parsed_text.created_at;
	alpha_report_object.message_body = parsed_text['text'];

	//create reporter object from parsed data
	//set reporter_id

	//need to figure out geo
	//alpha_report_object.longitude = parsed_text.geo
	//alpha_report_object.latitude = parsed_text.geo
	//radius?

	alpha_report_object.utc_offset = parsed_text.user.utc_offset;
	alpha_report_object.time_zone = parsed_text.user.time_zone;

	alpha_report_object['lang'] = (parsed_text['lang'] ? parsed_text['lang'] : parsed_text.user['lang']);

	return alpha_report_object;
}