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

	/*me.getTags({ message_body:'The bank was enormous @security_guard. #amazing A single open chamber with white pillars surrounding a tile mosaic floor, broad doors at the back that led deeper into the building. Two large revolving doors opened onto the street, with a set of conventional doors to the sides. Men and women streamed in and out, as if the room were the heart of some enormous beast, pulsing with a lifeblood of people and cash.', _id: 1234 });
	me.getTags({ message_body:'I knelt backward on a chair that was too big for me, watching the flow of people. I liked to watch people. The different shapes of faces, the hairstyles, the clothing, the expressions. Everyone showed so much variety back then. It was exciting.', _id: 4567})
	me.getTags({ message_body: 'David, turn around, please, my father said. He had a soft voice. I\'d never heard it raised, save for that one time at my mother\'s funeral. Thinking of his agony on that day still makes me shiver.', _id: 111111 });
	me.getTags({ message_body: 'I turned around, sullen. We were to the side of the main bank chamber in one of the cubicles where the mortgage men worked. Our cubicle had glass sides, which made it less confining, but it still felt fake. There were little wood-framed pictures of family members on the walls, a cup of cheap candy with a glass lid on the desk, and a vase with faded plastic flowers on the filing cabinet.', _id: 222});
	me.getTags({ message_body: 'At least he’d combed his hair, though it was starting to thin. He didn’t care about that as much as other men seemed to. “Just means fewer haircuts, Dave,” he’d tell me, laughing as he ran his fingers through his wispy hair. I didn’t point out that he was wrong. He would still have to get the same number of haircuts, at least until all of his hair fell out.', _id: 333});
	me.getTags({ message_body: '“Well,” the mortgage man said, clasping his hands on the table right beside a picture frame displaying a stock photo of smiling ethnic children. “Unfortunately, our underwriters don’t agree with your assessment. You’ll have to . . . ”They kept talking, but I stopped paying attention. I let my eyes wander back toward the crowds, then turned around again, kneeling on the chair. My father was too engrossed in the conversation to scold me.', _id: 44});
	//me.getTags({ message_body: '', id: });
	console.log(me.tags.sort(function(a,b){ return a.count - b.count }));*/
};