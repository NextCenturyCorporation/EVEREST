var TagService = require('../database/tag.js');
module.exports = function(models, io, logger) {
	var me = this;
	var tagService = new TagService(models, io, logger);

	me.addTags = function(obj) {
		if (!obj.message_body || !obj._id) {
			return ;
		}

		var id = obj._id;
		var stripped = obj.message_body.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\"]/g, '');
		var text = stripped.split(' ');

		text.forEach(function(word){
			if (word !== ''){
				tagService.get(word, function(err, docs) {
					if (!docs[0]) {
						var data = {
							_id: word,
							value: {
								count: 1,
								reports: [{ _id: id, type: 'alpha report' }]
							}
						};

						tagService.create(data, console.log);
					} else {
						var data = {
							value: {
								count: docs[0].value.count + 1,
								reports: docs[0].value.reports
							}
						};

						data.value.reports.push({ _id: id, type: 'alpha report' });
						tagService.update(word, data, console.log);
					}
				});
			}
		});
	};
};