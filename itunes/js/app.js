/****************************
*		 Application		*
*****************************/

window.App = Ember.Application.create({
	ready: function() {
		/*  */
	}
	//, LOG_TRANSITIONS_INTERNAL: true
	//, LOG_TRANSITIONS: true
});


App.Store = DS.Store.extend({
	revision: 12,
	adapter : DS.FixtureAdapter.create({
		simulateRemoteResponse : false
	})
});


/****************************
*		 Routing			*
*****************************/

App.Router.map(function() {
	// routes
	this.resource('list', function() {
		this.resource('list_song', { path: '/:song_id' });
	});
	this.resource('grid', function() {
		this.resource('grid_song', { path: '/:song_id' });
	});
});

App.LoadingRoute = Ember.Route.extend({});

App.IndexRoute = Ember.Route.extend({
	redirect: function() {
		this.transitionTo('list');
	}
});

App.ApplicationRoute = Ember.Route.extend({
	init: function() {
		App.SongsController.set('content', App.Song.find());
		App.SortMenuController.set('content', App.SortMenu.Data);
	},
	model: function() {
		/*  */
	},
	events: {
		setMetaInfo: function(data) {
			this.get('controller').play('dblclk');
		},
		setSelectedSong: function() {
			this.get('controller').set('isSelectedSong', true);
		}
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


App.SortMenu = Em.Object.extend({
    title: null,
	prop: null,
    isActive: false
});

App.SortMenu.Data = [
	App.SortMenu.create({id: 1, prop: ['title'], title: 'Alphabetical', isActive: true}),
	App.SortMenu.create({id: 2, prop: ['genre'], title: 'By Genres', isActive: false}),
	App.SortMenu.create({id: 3, prop: ['author'], title: 'By Author', isActive: false}),
	App.SortMenu.create({id: 4, prop: ['album'], title: 'By Album', isActive: false})
];

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


App.SortMenuController = Em.ArrayController.create({
	select: function(el) {
		this.forEach(function(item) {
			if ( el.get('id') == item.get('id') ) {
				item.set('isActive', true);
			} else {
				item.set('isActive', false);
			}
		});
	}
});

App.ApplicationController = Em.Controller.extend({
	currentPathDidChange: function() {
		App.set('currentPath', this.get('currentPath'));
	}.observes('currentPath'),
	isPlay: false,
	isSelectedSong: false,
	getCurrSongId: function() {
		if ( App.Router.router.currentParams ) {
			return App.Router.router.currentParams.song_id || false;
		}
	},
	meta_info: '',
	sortBy: function(el) {
		var curProp = App.SongsController.get('sortProperties'),
			prop = el.prop;
		if ( 0 === Em.compare(prop, curProp) ) {
			App.SongsController.toggleProperty('sortAscending');
		} else {
			App.SongsController.set('sortAscending', true);
			App.SongsController.set('sortProperties', prop);
		}
		App.SortMenuController.select(el);
	},
	getFormatMeta: function(data) {
		data = data || {get: function(){return ''}};
		return [
			data.get('id') + '. Title: ' + data.get('title'),
			'Author: ' + data.get('author'),
			'Album: ' + data.get('album'),
			'Genres: ' + data.get('genre'),
			' (Time: ' + data.get('time') + ')'
		].join(' | ');
	},
	play: function(btn) {
		if ( !this.isSelectedSong ) {
			return;
		}
		var songId = this.getCurrSongId(),
			currSong = {},
			curListType = '/' +  App.get('currentPath').split('.')[0] + '/';

		switch ( btn ) {
			case 'prev':
				if ( this.isPlay ) {
					songId = App.SongsController.prevSongId();
					this.transitionToRoute(curListType + songId);
				}
			break;
			case 'next':
				if ( this.isPlay ) {
					songId = App.SongsController.nextSongId();
					this.transitionToRoute(curListType + songId);
				}
			break;
			case 'dblclk':
				this.set('isPlay', true);
			break;
			default:				
				this.toggleProperty('isPlay');
				
		}
		if ( songId ) {
			currSong = App.Song.find(songId);
		}
		this.set('meta_info', this.getFormatMeta(currSong));
	}
});
 
App.ListController = Em.ArrayController.extend({
	
});

App.SongsController = Ember.ArrayController.create({
	sortProperties: ['title'],
	sortAscending: true,
	currSongIndex: function() {
		var curSongId = false,
			songIdx = false;		
		
		if ( $.isPlainObject(App.Router.router.currentParams) ) {
			curSongId = App.Router.router.currentParams.song_id || false;
			if ( false !== curSongId ) {
				this.filter(function(elem, idx) {
					if ( curSongId == elem.id ) {
						songIdx = idx;
						return true;
					}
				});
			}
		}
		return songIdx;
	},
	nextSongId: function() {
		var next = ( this.currSongIndex() || 0 ) + 1;
		next = ( next >= this.get('length') ) ? 0 : next;

		return this.nextObject(next).get('id');
	},
	prevSongId: function() {
		var prev = ( this.currSongIndex() || this.get('length') ) - 1;

		return this.nextObject(prev).get('id');
	}
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











