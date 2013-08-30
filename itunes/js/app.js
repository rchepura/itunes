/****************************
*		 Application		*
*****************************/

window.App = Ember.Application.create({
	ready: function() {
		var path = location.hash.substr(1).split('/')[1];
		if ( -1 == $.inArray(path, ['list', 'grid']) ) {
			location.hash = '#/list';
		}
		// Em.Logger.info('The App is loaded!!!');
	}
	//, LOG_TRANSITIONS_INTERNAL: true
	//, LOG_TRANSITIONS: true
});

/****************************
*		 Routing			*
*****************************/

App.Router.map(function() {
	// put your routes here
	this.resource('list', function() {
		this.resource('list_song', { path: '/:song_id' });
	});
	this.resource('grid', function() {
		this.resource('grid_song', { path: '/:song_id' });
	});
});

App.LoadingRoute = Ember.Route.extend({});

App.ApplicationRoute = Ember.Route.extend({
	init: function() {
		App.SongsController.set('content', App.Song.find());
	},
	model: function() {
		return [{
			prop: ['title'],
			title: 'Alphabetical'
		},{
			prop: ['genre'],
			title: 'By Genres'
		},{
			prop: ['author'],
			title: 'By Author'
		},{
			prop: ['album'],
			title: 'By Album'
		}];
	},
	events: {
		setMetaInfo: function(data) {
			var  metaData = this.get('controller').getFormatMeta(data);
			this.get('controller').set('meta_info', metaData);
		},
		setSelectedSong: function() {
			this.get('controller').set('isSelectedSong', true);
		}
	}
});


App.ListSongController = Ember.Controller.extend({
	init: function() {
		this.send('setSelectedSong');
	}
});

App.GridSongController = Ember.Controller.extend({
	init: function() {
		this.send('setSelectedSong');
	}
});

App.ListRoute = Ember.Route.extend({
	model: function() {
		var sid = App.Router.router.currentParams;
		if ( sid && sid.song_id ) {
			this.transitionTo('/list/' + sid.song_id);
		}
	}
});

App.GridRoute = Ember.Route.extend({
	model: function() {
		var sid = App.Router.router.currentParams;
		if ( sid && sid.song_id ) {
			this.transitionTo('/grid/' + sid.song_id);
		}
	}
});

/****************************
*		 Models				*
*****************************/


App.Store = DS.Store.extend({
	revision: 12,
	adapter: 'DS.FixtureAdapter'
});

App.Song = DS.Model.extend({
	title: DS.attr('string'),
	time: DS.attr('number'),
	author: DS.attr('string'),
	genre: DS.attr('string'),
	album: DS.attr('string'),
	icon: DS.attr('string')
});

App.Song.FIXTURES = PlayList;


/****************************
*		 Controllers		*
*****************************/

App.ApplicationController = Em.Controller.extend({
	isPlay: false,
	isSelectedSong: false,
	getCurrSongId: function() {
		if ( App.Router.router.currentParams ) {
			return App.Router.router.currentParams.song_id || false;
		}
	},
	meta_info: '',
	sortBy: function(prop) {
		var curProp = App.SongsController.get('sortProperties');
		if ( 0 === Em.compare(prop, curProp) ) {
			App.SongsController.toggleProperty('sortAscending');
		} else {
			App.SongsController.set('sortAscending', true);
			App.SongsController.set('sortProperties', prop);
		}
	},
	getFormatMeta: function(data) {
		data = data || {get: function(){return ''}};
		return [
			'Title: ' + data.get('title'),
			'Author: ' + data.get('author'),
			'Album: ' + data.get('album'),
			'Genres: ' + data.get('genre'),
			' (Time: ' + data.get('time') + ')'
		].join(' | ');
	},
	play: function() {
		if ( !this.isSelectedSong ) {
			return;
		}
		var currSongId = this.getCurrSongId(),
			currSong = {};
			
		this.set('isPlay', !this.get('isPlay'));
		if ( currSongId ) {
			currSong = App.Song.find(currSongId);
		}
		this.set('meta_info', this.getFormatMeta(currSong));
	}
});
 
App.ListController = Em.ArrayController.extend({
	
});

App.SongsController = Ember.ArrayController.create({
	sortProperties: ['title'],
	sortAscending: true
});

/****************************
*		 Views				*
*****************************/

App.SongListView = Ember.View.extend({
    templateName: 'song-list-view',
	doubleClick: function(e) {	
		this.get('controller').send('setMetaInfo',this.get('content'));
	}
});

App.SongGridView = Ember.View.extend({
    templateName: 'song-grid-view',
	doubleClick: function(e) {
		this.get('controller').send('setMetaInfo',this.get('content'));
	}
});

/****************************
*		 Collections		*
*****************************/

App.SongsListView = Ember.CollectionView.extend({
	tagName: 'tbody',
	itemViewClass: App.SongListView,
	content: App.SongsController
});

App.SongsGridView = Ember.CollectionView.extend({
	tagName: 'div',
	itemViewClass: App.SongGridView,
	content: App.SongsController
});













