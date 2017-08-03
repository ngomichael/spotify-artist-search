$(document).ready(function() {

    var client_id = 'a7f97cce8bc148568b050bde1fc86020';
    var client_secret = 'fdf579aefac941de8c82691b4567661b';

    var currentlyPlayingTrack = null;
    var trackElements = null;
    var otherArtistsElements = null;
    var topTracks = [];
    var trackPreviews = []
    var count = 0;
    var accessToken;
    $("#displayResultsButton").prop("disabled",true);

    if (window.location.hash) {
        accessToken = window.location.hash.split('=')[1].split('&')[0];
    } else {
        window.location.href = 'https://accounts.spotify.com/authorize?' + $.param({
                client_id: 'a7f97cce8bc148568b050bde1fc86020',
                response_type: 'token',
                redirect_uri: 'http://localhost:63342/spotify-artist-search/'
            });
    }

    /*
    When an option is clicked from the autocomplete div
    the value in the input is set to the clicked element
    and all of the options become hidden and the displayResultsButton
    gets clicked.
     */
    $('.suggestion').click(function () {
        console.log('hey');
        $('#displayResultsButton').click();
        var clickedArtist = $(this).html();
        $('#input').val(clickedArtist);
        $('#autocompleteContainer').hide();
    });

    /*
     With each keyup in the input, the options for autocomplete are shown
     count is set to 0
     */
    $('#input').keyup(function(e) {
        var key = e.which;
        $('#autocompleteContainer').show();
        var count = 0;
        var inputVal = $('#input').val();

        //If the inputVal is empty then the options for autocomplete are hidden
        if(inputVal === '') {
            $("#displayResultsButton").prop("disabled", true);
            $('#autocompleteContainer').hide();
        }

        //Else the searchedArtists array is set to empty and the there is an api call using the inputVal
        else {
            var searchedArtists = [];
            $("#displayResultsButton").prop("disabled", false);

            if(key === 40 || key === 38) {
                return;
            }
            else {
                //Takes the input value and gets a JSon file and parses through it to get the top 5 names
                $.ajax({
                    type: 'GET',
                    url: 'https://api.spotify.com/v1/search?q=' + inputVal + '&type=artist',
                    headers: {
                        Authorization:'Bearer ' + accessToken,
                    },
                    dataType: 'json',
                    success: function (result) {
                        $.each(result, function (index, item) {
                            $.each(item.items, function (index, artist) {
                                if(count > 4) {
                                    return;
                                }
                                searchedArtists.push(artist.name);
                                count++;
                            });
                        });
                        autocompleteInput(searchedArtists);
                    }
                });
            }
        }
    });

    //When this function is called the divs' HTML are replaced
    //with the searchedArtists elements
    function autocompleteInput(searchedArtists) {
        for(var i = 0; i < 5; i++) {
            $('#option' + i).html(searchedArtists[i]);
        }
    }

    //Press enter it clicks the search button
    $('#input').keydown(function (e) {
        var key = e.which;

        if(count > 4) {
            count = -1;
            $('#option' + '4').css("background-color", 'white');
        }
        else if(count < 0) {
            count = 5;
            $('#option' + '0').css("background-color", 'white');
        }

        if($('input').val() === '') {
            count = 0;
            for(var i = 0; i < 5; i++) {
                $('#option' + i).css("background-color", 'white');
            }
        }
        //Enter key
        if (key == 13) {
            count = 0;
            for(var i = 0; i < 5; i++) {
                $('#option' + i).css("background-color", 'white');
            }
            $('#option' + count).css("background-color", 'white');

            // console.log($("#displayResultsButton").prop('disabled'));
            // console.log(($('#input').val()));

            if($('#input').val() === '') {
                // console.log('this is wrong');
                $("#displayResultsButton").prop("disabled",true);
            }
            else if($("#displayResultsButton").prop('disabled') === true) {
                return;
            }
            else {
                $('#displayResultsButton').click();
                $('#input').blur();
            }
        }

        //Down
        else if (key == 40) {
            if(count === 0) {
                $('#input').val($('#option' + count).html());
                $('#option' + count).css("background-color","#809fff");
                $('#option' + count).css("border-radius","2px");
            }
            else {
                $('#input').val($('#option' + count).html());
                $('#option' + count).css("background-color","#809fff");
                $('#option' + count).css("border-radius","2px");
                $('#option' + (count - 1)).css("background-color", 'white');
            }
            count++;
        }

        //Up
        else if (key == 38) {
            count--;
            if(count === 4) {
                $('#input').val($('#option' + count).html());
                $('#option' + (count)).css("background-color","#809fff");
                $('#option' + count).css("border-radius","2px");
            }
            else {
                $('#input').val($('#option' + count).html());
                $('#option' + (count)).css("background-color","#809fff");
                $('#option' + count).css("border-radius","2px");
                $('#option' + (count + 1)).css("background-color","white");
            }
        }
    });

    //Creates an audio element and plays it
    function playMusic(url) {
        var music = new Audio(url);
        currentlyPlayingTrack = music;
        currentlyPlayingTrack.play();
    }

    //Pauses the audio element that was created in playMusic
    function pauseMusic() {
        currentlyPlayingTrack.pause();
        currentlyPlayingTrack = null;
    }

    //Adds a mouse over event onto the each song element on the page
    function addMouseOver(trackNumber) {
        $(trackElements[trackNumber]).mouseover(function () {
            playMusic(trackPreviews[trackNumber]);
        });
    }

    //Adds a mouse out event onto the each song element on the page
    function addMouseOut(trackNumber) {
        $(trackElements[trackNumber]).mouseout(function () {
            pauseMusic();
        });
    }

    //Adds a click event onto the each related artist element on the page
    function addClick(index) {
        $(otherArtistsElements[index]).click(function () {
            displayInformation(otherArtistsElements[index].innerHTML);
        });
    }

    //Displays the artist's top ten songs, image, name, and related artists on the page when called
    function displayInformation(inputValue) {
        $('#autocompleteContainer').hide();
        //Clears the page
        $('#artistName').html(" ");
        $('#topTracks').html(" ");
        $('#relatedArtists').html(" ");
        $('#artistImg').attr('src', '');
        topTracks = [];
        trackPreviews = [];
        trackElements = null;
        otherArtistsElements = null;

        //Changes styles of elements on the page
        inputAndButtonContainer.style.top = '22px';
        inputAndButtonContainer.style.left = '-32%';
        input.style.height = '20px';
        input.style.width = '175px';
        input.style.fontSize = '16px';

        autocompleteContainer.style.width = '175px';

        displayResultsButton.style.height = '29px';
        displayResultsButton.style.width = '95px';
        displayResultsButton.style.fontSize = '16px';

        artistName.style.top = '0px';

        //Gets the artist's image and name
        $.ajax({
            type: 'GET',
            url: 'https://api.spotify.com/v1/search?q=' + inputValue + '&type=artist',
            headers: {
                Authorization:'Bearer ' + accessToken,
            },
            dataType: 'json',
            success: function (result) {
                var counter = 1;
                var artistId = result.artists.items[0].id;
                $.each(result, function (index, item) {
                    $('#artistName').append(item.items[0].name);
                    $('#artistImg').attr('src', item.items[0].images[0].url);
                    $('#topTracks').append('<h2>' + item.items[0].name + "'s Top 10 Tracks!" + '</h2>');
                });

                //Gets the top ten tracks from an artist and displays it on the page
                $.ajax({
                    type: 'GET',
                    url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks?country=US',
                    headers: {
                        Authorization:'Bearer ' + accessToken,
                    },
                    dataType: 'json',
                    success: function (result) {
                        var counter = 1;
                        $.each(result, function (index, item) {
                            $.each(item, function (index, track) {
                                var musicTrack = track.preview_url;
                                var trackName = track.name;
                                $('#topTracks').append("<span>" + counter + ': ' + trackName + "</span>" + "<br>");
                                topTracks.push(trackName);
                                trackPreviews.push(musicTrack);
                                counter++;
                            });
                        });

                        $('#topTracks span').addClass('tracks');
                        var tracks = document.getElementsByClassName('tracks');
                        trackElements = tracks;

                        //Passes i to addMouseOver and addMouseOut functions
                        for (var i = 0; i < tracks.length; i++) {
                            addMouseOver(i);
                            addMouseOut(i);
                        }
                    }
                });

                //Gets an artist's top 5 related artist's and displays it on the page.
                $.ajax({
                    type: 'GET',
                    url: 'https://api.spotify.com/v1/artists/' + artistId + '/related-artists',
                    headers: {
                        Authorization: 'Bearer ' + accessToken,
                    },
                    dataType: 'json',
                    success: function (result) {
                        var counter = 0;
                        $('#relatedArtists').append('<h2> Related Artists </h2>');
                        $.each(result, function (index, item) {
                            $.each(item, function (index, artist) {
                                if (counter >= 5) {
                                    return;
                                }
                                var relatedArtist = artist.name;
                                $('#relatedArtists').append("<span>" + relatedArtist + "</span>" + "<br>");
                                counter++;
                            });
                        });

                        $('#relatedArtists span').addClass('otherArtists');
                        var otherArtists = document.getElementsByClassName('otherArtists');
                        otherArtistsElements = otherArtists;

                        //Loops through and passes j to the addClick function
                        for (var j = 0; j < otherArtistsElements.length; j++) {
                            addClick(j);
                        }
                    }
                });
            }
        });
    }

    try {
        $('#displayResultsButton').click(function () {
            var inputValue = $('#input').val();
            displayInformation(inputValue);
            $('#input').blur();
        });
    }
    catch (exception) {
        $('#error').append('Sorry, there was an error');
    }
});