console.log('--> script.js');

var SHARED = {
    isLoading: false,
    urlBreed: "https://api.thecatapi.com/v1/breeds",
    urlCatGroup: 'https://api.thecatapi.com/v1/images/search',
    urlCat: 'https://api.thecatapi.com/v1/images/',
    currentBreedId: "none",
    axiosConfig: {
        headers: {
            "x-api-key":'ed599a39-efe1-41e5-9a74-1a9e12f8d53a'
        }
    },
    masonGallery:null,

}


function getParameterByName(name, url = window.location.href) {
    console.log('getParameterByName():', name);
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


//Route components
const Home = Vue.component('home-template', {
    template: '#home-template',

    data() {
        return {
            isLoadingBreed: false,
            isLoadingCats: false,
            currentBreedId:"none",
            breeds: [],
            cats:[],
            catDisplay:[],
            catDisplayCount:0,
        }
    },

    mounted: function () {
        console.log("home-template --> mounted()");
        this.fetchCats();
    },

    methods: {
        fetchCats() {
            console.log('fetchCats():');
            var that = this;
            this.isLoadingBreed = true;
            var data = {};
            axios.get(SHARED.urlBreed, data, SHARED.axiosConfig).then(function(response) {
                console.log('response:', response);
                that.breeds = response.data;
                that.breeds.unshift({
                    name: "-- Choose Breed --",
                    id:"none",
                });
                that.isLoadingBreed = false;

                let urlParam = getParameterByName('breed');
                console.log("urlParam:", urlParam);
                if(urlParam != null) {
                    that.currentBreedId = urlParam;
                    SHARED.currentBreedId = that.currentBreedId;
                    that.switchCatBreed();
                }

            }).catch(function (error) {
                console.log(error);
            });
        },

        switchCatBreed() {
            console.log('switchCatBreed():', this.currentBreedId);
            var that = this;
            var data = {};
            that.isLoadingCats = true;
            SHARED.currentBreedId = this.currentBreedId;

            axios.get(SHARED.urlCatGroup+'?page=1&limit=100&breed_id='+this.currentBreedId+'&order=DESC', data, SHARED.axiosConfig).then(function(response) {
                console.log('response:', response);
                that.cats = response.data;
                that.catDisplay = [];
                that.catDisplayCount = 0;
                that.showCats();

                setTimeout(() => {
                    SHARED.masonGallery = $('#catBox .catCol').masonry({
                        itemSelector: '.card',
                    });
                }, 100);

                that.isLoadingCats = false;
            }).catch(function (error) {
                console.log(error);
            });
        },


        showCats() {
            console.log('showCats()');
            for(let i = 0; i < 10; i++) {
                if(this.catDisplayCount < this.cats.length) {
                    this.catDisplay.push(this.cats[this.catDisplayCount]);
                    this.catDisplayCount++
                }
            }

            setTimeout(() => {
                if(SHARED.masonGallery != null) {
                    SHARED.masonGallery.imagesLoaded().progress( function() {
                        SHARED.masonGallery.masonry('reloadItems');
                        SHARED.masonGallery.masonry('layout');
                    });
                }

            }, 100);

        }

    }
});


const Detail = {
    template: '#detail-template',

    data() {
        return {
            currentBreedId:"none",
            currentCatId:"none",
            isLoadingCat: false,
            catDetail:[],
            catBreedInfo:[],
        }
    },

    mounted: function () {
        console.log("detail-template --> mounted()");
        this.currentBreedId = getParameterByName('breed');
        this.currentCatId = getParameterByName('cid');
        this.fetchCatDetail();
    },

    methods: {
        fetchCatDetail() {
            console.log('fetchCatDetail():');
            var that = this;
            this.isLoadingCat = true;
            var data = {};
            axios.get(SHARED.urlCat+this.currentCatId, data, SHARED.axiosConfig).then(function(response) {
                console.log('response:', response);
                that.catDetail = response.data;
                that.isLoadingCat = false;
                that.catBreedInfo = that.catDetail.breeds[0];
            }).catch(function (error) {
                console.log(error);
            });
        },

    }
}


//Define routes
const routes = [
    {
        name:'Home',
        path: '/',
        component: Home,
    },
    {
        name:'Detail',
        path: '/detail/:searchValue?',
        component: Detail
    }
];


//Create router instance
const router = new VueRouter({
    routes: routes
});


//Vue instance
const vapp = new Vue({
    el: '#app',
    router: router,
});







