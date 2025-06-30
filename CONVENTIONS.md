# Video Transcript

[0:00] so if you're a developer that's worked on a remote team you've most likely come across this tool excal draw it's a free open source project that without even

[0:06] needing an account you can create live collaborative sessions where you can brainstorm with your teammates or people

[0:11] that you're working with um different ideas in a real-time manner it's a really cool product and I've been using it really heavily for years but recently

[0:18] I discovered that their API is insanely easy to work with with just a few lines of code you can embed an excal draw

[0:25] component into your react app and you can literally use it as if you're just on the excal draw website with that

[0:30] being said considering how easy it is to get the UI portion of this running I had the idea of building a project where you

[0:35] roll your own backend to manage a live collaborative sessions just like this but entirely built on top of Cloud fl's

[0:41] durable objects now in this video we're going to cover just that we're going to go through the setup of websockets using durable objects in hono we're going to

[0:47] learn how to manage real-time multi-user State and then we at the very end we're going to deploy this project to cloudflare under our own domain so

[0:53] before we get started in the code let's talk about websockets websockets enable real-time two-way communication between a client like a web browser and a server

[1:00] over a single persistent TCP connection allowing for efficient data exchange without the need for constant pulling

[1:05] before we go into websockets let's actually talk about this idea of polling so traditionally especially in the serverless world when you're building

[1:12] something and you need data constantly refreshed on the page a common pattern is basically to build some logic into your your UI to continuously reach out

[1:18] to the server and the server is going to go to a database it's going to try to get the most recent version of that state and then it's going to send that data back to the client and then maybe

[1:24] you have some user that's doing something and then that user does something that gets some data onto the DAT database the next time your web

[1:31] client reaches out to the server hits a database it gets that updated State now this is a pretty simple pattern to

[1:37] implement and I think that is like often the the pattern that we reach to when we're Building Services because websockets can be a little bit tricky

[1:43] but they're also pretty fun to work with so let's get into what the websocket like how websockets are going to work at a really really high level so as you're

[1:49] using excal draw you open up a web page and you share a link that's basically going to enable this live collaborative

[1:56] session when you open that link essentially what's happening is you are creating a two a connection with the server and that server is going to be

[2:02] storing that data probably on a database somewhere but then also it's willing to accept connections with other web pages

[2:08] so you can share your live collaborative link you have multiple clients all with that same link all with the same drawing and then whenever you as user one or

[2:14] client one send some data to the server the server has a persisted connection with both client 2 and client 3 and then

[2:20] sends those updates directly to them so this is fundamentally different where you're not just like making a request

[2:25] getting a response closing the connection you're making a request establishing a connection and that connection remains open throughout like

[2:31] the life cycle of your time using that application and this model actually isn't something that like traditionally

[2:36] works really well in the serverless world but with cl durable objects we can build just this so let's get over to the

[2:42] code so to get started let's quickly go over the project structure and how we are running things here we have a super

[2:47] basic react app that's exposing this path excal draw and implements an excal draw component this excal draw component

[2:52] is just a wrapper around the excal draw element and this element is coming from this Library um excal draw it's it's

[2:58] open source it's all ready to go all you have to do is is literally in St skele draw imported into your project and then

[3:03] you have a react app that basically you know gives you the ability to use excal draw um on your Local Host it's pretty

[3:09] cool so really easy to get started and to create the application like don't think too much about the whole project

[3:14] set up I really just like to follow Cloud FL docs they have a bunch of these framework guides they have one for react

[3:20] this runs on the workers platform you just run this command you can name it whatever you want you're on this command and it's just going to start this entire

[3:26] app for you it'll be ready to go so really easy to get started this is the project structure um I'm going to link everything in the docs and the GitHub so

[3:31] you'll be able to clone this later if you want but if you want to start from scratch I I love just going to their their docs looking at the framework

[3:37] guides and seeing how they recommend getting started when you want to build something that deploys to Cloud flare okay so to kind of understand what we're

[3:42] going to do with excal draw let's go over um how this live session works so basically if you open Excel draw and you

[3:48] hit share link go copy the shared link into um an incognito tab you can see that whenever I move the mouse on the

[3:54] left screen that state is going to be reflected on this this right window and then vice versa over here so if I'm moving on the right you can see that the

[4:00] cursor is being updated on the left side basically what they're doing here is they're implementing web sockets to cascate the state from one client to

[4:06] another even though I'm running on like you know like the same computer here you can imagine like this this window would be like somebody across the world and

[4:12] this would be my tap here and you'd be able to see exactly what somebody's doing in real time so we're going to recreate this in order to recreate this

[4:18] we head over to the excal draw docs we can see that they publish a bunch of information about their API um they have

[4:23] like onchange event on pointer update event and then we can kind of read what what these events are going to do so

[4:29] there's one that that I care about here it's called on pointer update which it basically just takes in a payload it

[4:35] gives you an x and y coordinate so we're going to go ahead and say payload and then if we head over to our

[4:40] application that's running locally we can inspect the

[4:46] console and then as we move this guy around you can see we get a bunch of these pointer events and these pointer events is just giving you like the X and

[4:52] the y coordinate and then up a pointer type I think that's essentially just like this little icon that renders on the screen but we're what we're

[4:58] ultimately trying to do here is if we have a client say client one two client three and then over here

[5:07] we have our server and this server is basically going to be a durable object what we want to do is we want to say whenever the pointer event changes for

[5:14] client one that state is going to castigate down to client two and to client three and that same pattern is

[5:20] going to follow for all these clients so basically we're going to say whenever the pointer event changes we come to the durable object the durable object has a

[5:26] connection with the client one and the client two and then shares that state so the UI can reflect so with that being said let's head over

[5:32] to the back end code um and then we're going to kind of go through exactly how to set up the durable object and the apis that we care about in order to kind

[5:37] of manage that state to get started with durable objects we can head over to the documentation to see some basic examples and usage we're not actually going to

[5:43] follow this guide we're not going to be using the durable object starter template but we are going to take some inspiration on how to set up a durable

[5:49] object here you can see that there's some basic syntax on how you can import a durable object from cloud flare workers how you can implement it how you

[5:55] can expose a method how you can access that method behind an API and then most importantly how you configure your

[6:01] project to basically tell cloudflare that you have a durable object for us what we're going to do is we're going to head over to the hono starter template

[6:07] and we're going to create a hono API that's going to be the Gateway as to how we access our durable object so you can

[6:13] go ahead and follow this command deploy it to the workers platform name it whatever you want that's what I've done here as you can see we have a super

[6:20] basic um starter hono template and it just returns hello so we can run run Dev

[6:26] and you can see we have a application running on our local post that's serving this API moving over to the durable object side of things we're going to

[6:32] create a new file called durable object and this is going to contain all the logic specifically for the durable object I don't like to put it inside the

[6:38] index.ts file the way that you see in the examples just so we can segment our code and make this project a little bit more manageable we're going to create a

[6:44] super basic durable object class that is that that's called scal Draw websocket server this extends a durable object and I'm passing in the cloud flare bindings

[6:50] you'll be able to see what this is where this is coming in just a minute um but essentially this this class has a

[6:56] counter and it has this increment method we're going to delete later I want to show that we can validate how the durable object is working coming over to

[7:02] the index.ts file we will export the excal draw websocket server class inside this file and then what we're going to

[7:09] do is we're going to head over to our Wrangler configuration and the Wrangler configuration you yours might be Wrangler toml I've been using the Json C

[7:16] just because I I like the Json structure a little bit more than tomall but it really doesn't matter um the only thing

[7:21] that you have to add here is the durable object you're going to pass in a binding and you're going to pass in the class name this class name will be the exact

[7:27] class that you export here and your project configuration knows where to pull it from because the main is going

[7:33] from the index.ts so we have our web socket server here it's exported and we are

[7:38] defining the durable object inside of our configuration here and then you're going to have to add this migrations command um if you ever have to like

[7:45] change the name of your durable object you can manage the migration of like that class name here I typically don't

[7:50] like to do that because it can get a little bit cumbersome but this is what you need you save that and then you're going to go ahead and run the CF typ gen

[7:57] command in your terminal and what that's going to do is it's going to spit out this code or these types inside of the

[8:04] worker configuration d. DS and you can see here we have durable object which is the name that we defined here so if we

[8:10] were to change this to just let's just say we said like test we ran this CF

[8:16] type gen again you can see that now the name is test but obviously we want that a little bit more descriptive we in the

[8:21] CF type gen we have our durable object um we we can access our durable object here and we have the name space and it's

[8:28] importing it from the index.ts this is like the basic setup of how you know

[8:33] cloudflare has configured the projects for it to work for you when I'm working on things in production I do this slightly differently but that's neither

[8:39] here nor there because this Project's going to work perfectly the way that it is right now and that's essentially what's happening with this cloudflare

[8:45] binding so here with hono we can access the cloud Flor binding we're going to basically say ID now you can see here

[8:51] we're able to access the durable object we're able to call ID from name this is basically going to give us an ID for a

[8:56] durable object which we can get I'm going to call this stub because this is how they do in the dog durable object. ID and this is going to

[9:02] give us access to that to the durable object that we defined um the durable objects are segmented based upon the ID

[9:09] that you pass in here and from here you can see we're able to say const so you

[9:15] can see here we're able to call the durable object so stop durable object increment which is the method that we

[9:20] defined right here and then we're just going to return

[9:25] count I'm going to run this project

[9:32] now if we head over to our project you can see that this counter is able to increment every single time that we call

[9:37] um that we call this inpoint so from here you know your durable object working this is like just super simple basic boiler plate I don't go through

[9:43] this process every time I set up a project because I know how to do it but I think if you've never seen durable objects before this is a great way just to make sure just just to know that your

[9:50] Project's working properly so now that we're set up here we're going to move into the actual API for managing

[9:55] websockets taking a look at the durable object documentation under examples there's these two sections about building a websocket server there's

[10:02] build a websocket server and then build a websocket server with websocket hibernation looking at the build a websocket server you can see if you've

[10:08] worked with websockets before this pattern is very it will be very familiar to you you create a server you add an

[10:14] event listener listen to the message event and you can handle in incoming messages this is just sending data back

[10:20] to the sender and then you can Define another event listener on close there's a few other events that you can listen to um so this pattern is pretty typical

[10:26] if you've ever worked with websockets and express or in Python for that matter it's a very similar process but uh the

[10:33] the issue with this is websocket connections pin your durable object in memory so dur duration changes will

[10:38] incur so long as the websocket is connected regardless of activity to avoid duration charges during periods of

[10:45] inactivity use web socket hybernation API So based on this it's basically saying that if you just have connections

[10:51] that are being maintained but nothing is happening there's no events coming to the durable object or being sent from the durable object it's going to incur

[10:58] duration there which could get really expensive um and then you have to be very careful about you know actually

[11:04] closing out connections due to inactivity and it's going to add a whole bunch of blow to your application I can't think of a single use case right

[11:09] now that you know that's realistic where I would actually use this pattern of websockets and durable objects I'll

[11:14] almost always opt for the hibernation approach the core difference here instead of defining inside of a fetch

[11:21] function a websocket server handling the listeners there and then building the code all in here there's actually apis

[11:28] that the durable logic has that manage a whole bunch of like the life cycle events for web for websocket

[11:34] specifically so we can take a look at this so essentially you can create a websocket pair this is the same as in

[11:39] the first example create your client in your server and then you call this accept websocket connections this is

[11:44] just basically telling the cloud for a runtime that you are now starting a websocket connection and you're going to be relying upon the hibernation API to

[11:52] manage the life cycle of those connections there's some more explanation here um if you go through the documentation and then there's these

[11:58] built-in methods me that essentially allow you to build out all of the logic that you want for managing websocket so

[12:03] you can see that you have this websocket message which is going to be called every single time a websocket um every

[12:09] single time a message is sent from a client and then websocket close and there's a few other ones and we're going to take a look at that in just a minute

[12:16] so the pattern is pretty similar but instead of defining all of your business logic inside of this fpch function all

[12:22] you're doing is you're creating your connection you're accepting it so you're calling this built-in method you're

[12:28] returning this client object back to the client that's trying to initiate the connection with your websocket server and then all of your business logic go

[12:34] under here so we're going to take a look at how to actually you know roll this out for our use case and we're going to start learning how to build upon this

[12:41] existing API and then you're also going to you're also going to discover how you know it's really powerful that cloud

[12:46] flare is going to manage a life cycle of websockets for you because it can get pretty complicated so heading back to our code we're going to go to our

[12:52] durable object and we're just going to literally Implement what we saw in the docs just now we're going to delete this increment method because I don't really

[12:58] care about it anymore we know that the stable object is working and then we're going to just kind of cover cover

[13:03] exactly what this what's happening here so we have our fetch method and we are going to start Implement a web socet

[13:10] pair this is going to provide a client in a server and then we're going to pass in the server to the except web socket

[13:16] which is built into the durable object this is going to let the runtime know that we are starting durable object connection and it should be managed by

[13:22] the hibernation API then we're going to respond to the user this is just the very typical response pattern for web

[13:28] sockets you would turn the status of 101 and then you're going to have a websocket that Returns the websocket

[13:33] client and this is going to allow that connection that two-way connection to be made with the server and the client um

[13:38] then here's some of the apis that we just went over so we have the web sucket message this is going to be called every single time a message is sent from the

[13:44] client and then we're going to be able to handle that so right now all we're going to do is Echo that message back to

[13:50] the client and we're also going to count the number of websockets or clients that

[13:55] are currently connected to our durable object and we're going to get into this later because is really powerful um and

[14:01] then on websocket close we're just going to log that the websocket has closed and then you can see there's actually other

[14:06] methods as that that's part of the durable object that you can call like if a websocket arrow errors out you can capture that event and then you can

[14:12] handle it if you need to handle it when it opens for the first time we're actually going to build upon this in the example that we're implementing today

[14:18] but these are two you know additional methods and there's a few more related to websocket so they have a bunch of the

[14:24] life cycle methods baked into durable objects we're going to delete these for now and we're going to head over to our API okay so for our API we're going to

[14:30] get rid of this route we don't need it anymore but we're going to basically be following the same pattern as before I'm actually going to wait a second before

[14:36] deleting it if you remember I deleted the increment method so this is going to be showing a type error because this doesn't exist so what we're going to do

[14:43] now is we're going to create an additional endpoint here um SL

[14:48] aiws for websocket and then we're going to have this parameter that is drawing ID and the drawing ID is going to

[14:54] represent a drawing in excal draw we're going to pull the drawing ID out this is just basic hono um some Antics here and

[15:00] then we're going to make sure that the connection that's being requested from the client is indeed a websocket if not we're going to error out and then what

[15:07] we're going to do is we're going to collect we're going to grab the ID from the durable object and we're going to be

[15:13] passing in the actual um durable object ID looks like this is not always defined

[15:19] so we're also going to say if we're going to return missing D drawing ID okay so at this point we now have the

[15:26] stub so the durable object the instance of the durable object and when we pass in the drawing ID essentially what

[15:32] happens is an new instance or an existing instance if it's been created before of a durable object specifically

[15:37] with that ID is going to exist so you can imagine if you have dozens of different drawings and you want to save of information related to each drawing

[15:44] it can be segmented by the drawing ID and then the drawing data can be stored in the durable object and then the connections can also be managed based

[15:50] upon a drawing so this is kind of how you can segment your state specifically for your business use case which is

[15:56] segmenting drawings in excal draw and then we're going to be passing in the

[16:01] the um request into the fetch method which we implemented here so this is

[16:07] part of the durable object API is this fetch method this isn't something we just made up it's part of the durable object and we're passing in the Raw

[16:14] request into there and it's being returned so we're basically just passing in this information setting up the

[16:20] durable object and then we are relaying that um connection back to our client so we can maintain this two-way connection

[16:27] that persists um and and that's essentially how we're setting up the server on the websocket so now we're going to head over to the UI and we're

[16:33] actually going to connect to this locally we're going to connect to this websocket and we're we should once this is all set up correctly we should see

[16:39] this message um come back to us both in the console we'll log it out and we'll

[16:44] see it in the network tab as well so if you remember in our UI every single time our pointer moves or updates

[16:51] essentially we're just logging out that payload which is giving us the coordinates where the mouse is on the screen so it's looking like this you can

[16:56] see we get the X the Y and the pointer tool now ultimately what we want to do is we want to instead of logging it out

[17:02] we want to send that to our durable object so what I've done is I've implemented a pretty basic um hook that

[17:08] is going to establish a connection with the websocket and I'm just going to walk through this code really quickly on your own time you can go look at the best

[17:14] practices for using websockets inside of react this is just a pretty boilerplate example of it and there's probably

[17:19] better patterns out there I I I wouldn't roll this exact solution if I was doing this in production but for the purpose of this example I just want to connect

[17:25] to a websocket and show how this is working so this is a hook and um when this component mounts we're establishing

[17:32] a connection with the websocket that we have running or with the server that we have running locally and then we have a

[17:39] two event handler so essentially on message whenever we receive a message so whenever the client the client or your

[17:46] UI or your web page receives an event from the server it's just logging it out and then we're also logging out that um

[17:52] whenever when when the websocket is actually opened and been connected that the websocket has opened then

[17:57] essentially what this code is doing is is it is taking our um it's taking our websocket and it is returning this

[18:03] method that is going to send data to our server so we have our server defined

[18:08] here and then we have this method that takes in an event and then stringify that data so it can be in the right

[18:14] format to be received by our server um and then I'll show you exactly how we use it so we export this use buffer web

[18:20] socket and I I'll get back to this naming later on WE we'll see why I'm I'm intentionally using the word buffer here

[18:26] now we have our scal draw component I have imported our use buffer websocket

[18:32] which is returning a method that sends data to our server and creates that connection at the same time and then we

[18:39] have this method um this call back which is send event and then what I'm going to do is instead of logging out our payload

[18:45] I am going to say send event here now if we go back to our UI we can look so I'm

[18:52] going to reload this page and you can see that we have this outbound request um that went to id1 and I guess I

[18:58] probably should have touched on that a little bit as well we are grabbing the ID from the path so we have excal draw

[19:04] and then id1 here we're grabbing that ID passing it into our websocket and then that's being appended to the end of this

[19:11] um path for our API just this is what we're using to segment the drawings if you remember um what we just barely

[19:16] talked about so now we have this connection that's made and you can see that as we move our Mouse around there

[19:23] are events going over our Network um events are being sent and they are being received so you can see this red arrow

[19:29] right here is an event being received and then um this is going outbound so I'm going to kill our server really

[19:35] quick just going to restart it again and then I'm going to come over to the console log we'll refresh this page and

[19:40] you can see our logs websocket opened here and then every time I move this mouse we have this received event so

[19:45] essentially what's happening is we have our server and we have our client so this

[19:54] web page and then we are making this request

[20:00] and we're establishing a two-way connection that is persisting so this connection is not closing and the client is continuously sending data to the

[20:06] server and the server is just kind of echoing some of that data back to the client and that's what we're seeing in the logs is the data directly from the

[20:11] server so what we can do here is we can grab this URL pull this in just a little

[20:17] bit here and we have this incognito tab so I'm just going to reload this so you

[20:22] can see as well here that we have you know Incognito and we're getting this

[20:27] data as well so um and just pay attention right here we have this message and this is being sent from our

[20:32] server and it says connections 2 so we have connections 2 come over here move this guy around you can see

[20:39] I'm going to reload this page again so you can see connections two now I'm going to close this so now that this is

[20:45] closed our server has received this close event move our Mouse around now you can see it's connections one here so

[20:50] basically the second that we closed our um tab that connection Clos our server recognized that and then the next event

[20:57] that we received in this incognito tab was we only have one connection so we can come back to here love this and move

[21:04] this guy around now you can see connections too so what we have here is we basically we're we're relaying data

[21:10] back and forth from the client in the server but one thing that you should note is when I move the mouse on this

[21:17] web page we're getting data from we're getting data from this client to a server back to this client but we're not

[21:24] getting any events over in this incognito tab on this side and vice versa so if I cleared this guy come over

[21:29] here start moving stuff around you can see we're getting the events here but we're not getting it in this window and

[21:35] essentially this is going to lead us into how we're ma we can actually manage the state amongst multiple multiple clients on our server so if we have our

[21:43] server the current behavior is we have client one and client two and client

[21:48] they're both they've both established a connection with the server that's persisting but every single time client one sends some data to the server it's

[21:55] echoing back to client one but that data isn't going from client one and then back to client two and this is the

[22:00] behavior that we want where if we create client three in here as well and we have this two-way connection we want client

[22:06] one to send data to the server and then we want to see the logs in both client 2 and client 3 but we don't necessarily

[22:12] want to see the logs in client one and the reason for that is because when your mouse moves on your web page you don't

[22:20] really necessarily care about where your mouse position is you just want to tell the server where your mouse position is so the server can tell the other clients

[22:26] that you are indeed on the page and you're moving around so let's go ahead and head back to our back end to see how we would implement this so taking a look

[22:33] at the server side code that is handling the receiving and sending of messages that come to the server sending it back

[22:39] to the client we can take a look at the websocket message method that's part of the durable object and right now all

[22:45] it's doing is it's receiving a websocket so this is the the websocket for the current client that's sending the data

[22:51] to the server and then that message that that client sent and all we're doing is we're sending the data back to the

[22:56] client here but what we can do is we can access this get methods websocket array to get all of the websockets or all of

[23:02] the clients that are currently connected to this server and then we can Cascade the message to all of the websockets

[23:08] that are connected or select few so let's take a look at what that would look like so basically what we have here is we have a loop that's defining socket

[23:15] um from this list of currently connected websockets and then for each individual

[23:21] socket it's relaying that same message back so what we could do is if we basically leave this code AS is whenever

[23:27] any client sends some data to the server that data is going to go to all of the currently connected sockets and send

[23:33] this message to all of those to all of those clients now we want to identify all of the sockets that don't belong to

[23:39] the client that's sending this message because we don't want to send this message back to the client we want to send this message to all the other clients um that are connected to this

[23:46] durable object so we can say so basically what we can say here is if the socket in this Loop for this specific

[23:54] socket while iterating over the git web sockets equals the so socket that is current that that sent this message then

[24:01] we're just going to bypass that if not then we're going to continue this iteration and we're going to send the

[24:07] data back so the behavior of this should be um whenever we move our Mouse in the UI we should be able to see on the on

[24:14] the logs of the other server or when the logs of the other client the events come

[24:19] through but not for the web page that is actually sending those EV so to make it a little bit more clear let's head over

[24:25] let's establish a connection here let's establish a connection here this is our incognito tab so you can see you can see

[24:30] that there so I'm going to go do this from scratch here so let's clear the guy so every time I move in this web page

[24:37] it's logging out in this other um it's logging out on the other web page that has the connection to the the server and

[24:43] vice versa so I come over here I start moving this around so you can see we're not getting any logs on this

[24:49] web page but we are indeed getting logs over here which is pretty cool so essentially what we've done is we we

[24:55] basically created the fundamental pattern of how our ser is going to be managing State amongst multiple clients so we have our server and then we have

[25:02] client one and we have client two and when client one sends some data to the server that data doesn't come back to

[25:08] client one it actually gets pushed to client two and if we opened up more windows essentially what would happen is

[25:14] this data this data going from web page one or client one would go to the server and then it would Cascade down to all of

[25:20] these other web pages that are connected to the server but not to the client that it's sending so that's how we're going to actually wire in this behavior for

[25:27] moving the Mouse and seeing it show up on the other screen so let's actually go ahead and make a small UI change to get this Behavior so so taking a look at the

[25:34] code that's handling the websocket in our UI I've added an additional prop that gets passed in to this hook called

[25:40] handle message and ultimately what's going to happen is instead of logging the message that we receive when we get

[25:45] data back from the server we're going to pass that data into the handle me um handle message that way we can Define

[25:51] the logic of this inside of our component that is rendering excal draw now I've added some additional things

[25:58] like um I've added a few Zod schemas here where it's basically just defining a few different types to make things a

[26:03] little bit cleaner on this end um so we can manage it a little bit better but don't pay too much attention to this just know that we're passing the data um

[26:10] into handle message and then that data is going to be used by the UI to do something so from that perspective this

[26:16] is really all that's changed on the websocket side of things and then I can kind of show you how we've wired this into our

[26:23] UI so ultimately we've defined a few different things and I'm actually going to start from the bottom here so the

[26:29] excal draw component that we have here previously on the pointer update we were

[26:34] sending that data to the websocket um just as is but what I'm doing here is I'm taking this type that I call a

[26:40] pointer and then I pass in some additional data about the user ID um this just kind of like the username that

[26:46] renders on the screen I just I'm creating a random ID so you can kind of see the difference between the users that are actively moving their Mouse on

[26:53] the screen and then the x and y coordinate so whenever on the UI we move our Mouse around it's going to send to

[26:59] the websocket but it's going to be sent in the specific data type so it'll be a little bit easier to work with as we

[27:04] grow this project um and then the other thing that we have here is there's this hook inside of the excal the draw um

[27:12] component that is setting the excal draw API which gives us access to call different handlers to update the UI when

[27:19] things happen so basically all that we've had to do is um pass in the API and I have a state object that is

[27:26] defined up here which um is going to default to null but then when the

[27:31] component renders it's going to give us access to that API and then we're going to be able to handle um some different

[27:37] logic throughout whenever we receive events from the server so I can show how that's also being used um some other

[27:42] basic stuff here uh a user ID literally just randomly generating an ID when the

[27:47] component mounts then I'm flushing it to the local storage just so we can access it later and that user ID doesn't change

[27:54] every single time we refresh our page or render our um our Dev server here and

[27:59] then there's just been a little enhancement here to the handle message so basically now instead of just taking the type any we're going to be taking in

[28:05] this buffer event type which is going to have access to the pointer and the coordinates on the screen and whenever

[28:11] we receive data from um the server that's related to the pointer event it's going to flow through here and then this

[28:18] this method here is doing a few different things I'm just going to go through it really quickly but I would encourage you if you're interested in excal a draw to kind of dig into the API

[28:25] and see what's happening here but basically um excal draw gives us access to collaborators those are like the

[28:31] other people that are currently working on the project with you and um this is just like a map of all of those unique

[28:36] users so basically we are getting all of the um collaborators and then we're creating um so we're creating this

[28:42] collaborator set or this map and then we're adding um the data from the server that we're getting so you can imagine if

[28:49] um somebody from somebody working on the project the data goes to the server it comes back here and we have access to

[28:54] that user ID um from the data that's coming in from the server and we have access to their coordinates and we are

[28:59] setting the collaborator and then finally the very last thing we're doing here is we're calling that API the excal

[29:05] API and we're updating the scene with the all of the collaborators and the new updated um positions of their of the

[29:12] mouse like of their location on the screen when they're moving around so um that's literally it from the UI side

[29:19] we've just kind of hooked into the excal API and I'm going to link this into GitHub I know it's probably kind of hard to follow just because there's a lot of

[29:24] moving pieces here but as you can see when we come over here we refresh these pages when I move this around on the

[29:31] right side you can see that you know we we get that we get that pointer on that left and vice versa when I come over

[29:37] here it the the mouse U movements are reflected onto the incognito tab so

[29:43] basically it's pretty cool that we have our server and we have client one that's

[29:48] sending some data to the server and that server is pushing this to client two and if we were to basically open another

[29:56] incognito tab here we are going to see the mouse

[30:04] here we'll see the mouse here so now we have basically three users now one thing you're probably noticing right away is

[30:10] when I open that new window you know we're not getting the drawing that's on the screen even though we're all part of

[30:15] the same um part of the same drawing ID and that's the next piece that we have to build out so let's go ahead and take

[30:22] a look at the excal IPI to kind of understand exactly what types of events we can listen to to

[30:28] get the data whenever like a drawing occurs on the screen that way that data can be sent to our server and then it can Cascade down back to all the clients

[30:35] that are currently live on the session of excal draw so looking at the excal draw component there's this onchange

[30:42] method that gives you access to the elements and it gives you access to the App State so what we're going to do is

[30:48] we're going to go ahead and we're going to log out this onchange to kind of understand exactly what's going on here I'm going to refresh the page and I'm

[30:53] going to start moving stuff around you can see that we have this empty array which I would assume would be the elements and then we have this block of

[30:59] data which is going to be the App State now what I'm going to do is I'm going to draw something on the screen and now we

[31:05] can see that there is indeed an element in this array let's just grab one more let's put a circle on there so now we

[31:11] have two elements in here and you can see that this has some information about the appearance of that element the size

[31:18] the location what type of element it is an ID and there some other interesting things in here like you have um a

[31:26] version you have updated time now just looking at the behavior of this on change is there's a ton of data that's

[31:32] being sent like every time the mouse moves or clicks or anything's dragged there's a bunch of data that is emitted from this event so it might be pretty

[31:38] tricky right now to build out um a listener and a Handler to to look at this data because you know like what are

[31:45] you going to do if you have like a thousand different elements on the screen are you actually going to send all of those elements to the server

[31:50] every single time it updates because that's going to be way too much data that's being passed back and forth so if I were to do this in like a true

[31:56] Production Way and I would encourage you if you're interested in learning more about um learning more about how to you

[32:01] know build really cool systems on top of websockets and durable objects and if you're interested in excal draw what I'd probably do is I would go about looking

[32:07] at what you have in the App State because what I was noticing before is there is this um there is essentially

[32:14] this uh property called selected element IDs which has the ID of the element that

[32:19] is currently selected so every single time you move something that's selected you're going to notice that inside of

[32:24] that property there's going to be two of these IDs so you usually when you're working in excal you're just kind of moving around one or two things at a

[32:30] time so what I would probably do is if I was to build this system I would do something like listening to that event

[32:36] that the change event and then I'd go collect the elements that were changed or selected and I'd parse a subset of that data that actually is useful to

[32:43] like indicate something changed um You probably don't need that whole block and I would also keep the version the the version that's inside of this element so

[32:51] because every single time that element moves this version increments and that would be sent to the server and then on the back end I would

[32:57] have some logic to basically keep track of every single element and then I would check is it the most recent version of

[33:02] that element if so broadcast that back to all the other clients and then update the state um on the back end that way

[33:09] you can always have like the most current version um of the of the state of the excal draw drawing that's kind of

[33:15] like how I think that they're implementing it currently um in the actual excal draw tool that you and I

[33:20] use all the time um but you know and that's neither here nor there we're not actually going to build out this entire

[33:25] thing because we're already really deep into this video and I don't want to just bloat this so I think that this is a really really cool project if you're

[33:31] interested in learning more to go ahead and try to implement something like this because you're going to learn a lot about like you know how to keep track of State how to handle race conditions how

[33:37] you can actually like efficiently broadcast data to a bunch of different clients and once your drawings get really big you know like how do you

[33:42] minimize the amount of data that's going back and forth to make things more efficient um but kind of getting back to

[33:48] like how we're actually going to build out this feature Where We sync the drawing to all the clients I kind of

[33:53] thought of a little hack that is far from production ready but it's at least going to get the state of the elements

[33:59] to our server and we'll be able to Cascade that down to different clients so there is this um onp pointer up event

[34:06] which basically whenever you do anything when you move an item or you you know draw an arrow or you type something you

[34:12] typically are going to have to press up on the arrow in order to do that unless you're using all key command so this is

[34:17] far from like a great solution but is but basically what I'm going to do is I'm going to listen to that specific

[34:22] event because it's only going to fire if I turn off the the logs for the onchange

[34:28] it's only going to fire whenever you know the mouse is clicked clicking around the screen if I move this around let it go you can see that we we we got

[34:35] that event so from here what we can do is on that Mouse pointer up instead of logging it out what I'm going to do is I

[34:41] already have this kind of pre-baked but I am going to um I am going to call the API get scene

[34:50] elements so this is going to get the most recent version of your element scene and the reason why this is like

[34:55] very very far from production ready is you know like we're just sending this entire block of elements every time

[35:00] that's not very efficient but also you're going to have a bunch of race conditions because multiple clients can be doing this at the exact same time and

[35:06] the server is not going to have any way of reconciling like what's the most recent version of um what's the most recent version of like those elements

[35:12] it'd be very hard for the server to do that so this isn't the approach if you were to build this and release it to people don't do this but for our use

[35:18] case all I'm going to do is I'm going to broadcast that that back and you're going to notice that I'm going to close this guy refresh this page bring this in

[35:25] just a little bit and then I will go grab this so let's see you can see we

[35:31] have this draw something and mouse up and we got that state so it went to the server and it cascaded back down to the

[35:37] other client do the same thing here boom and boom so at least we have like you

[35:44] know the remnants of what this could be and it's far it's far from like what the production version would be as I said before but this is um so basically what

[35:51] we have here is like that that data is being sent back and forth and it's going to the server but like it's actually not being stored anywhere so the second I

[35:57] refresh this page I'm not going to get the updated version you know if I were to go over here and like draw something

[36:03] then it would be updated and let's say I refresh this page again I move this guy and boom now I just wiped out the state of um I just wiped out the state of like

[36:09] the actual like drawing for the other person so that's kind of why this isn't isn't this is a far from production

[36:15] ready solution but what I think we can do just to kind of illustrate the last thing that I want to show about durable

[36:20] objects is how do we persist the element State on the durable object that way when we re when we refresh the page

[36:25] we'll be able to pull the most recent version on those elements so um okay so what I'm going to do is

[36:30] I'm going to head over to our back end and we're going to go to the durable object and what we can do is we are

[36:37] going to create an element called elements you know what I actually have this written out already so I'm just

[36:43] going to pull it over just to save a little bit of time okay so what we have here is we

[36:49] have an elements array and this elements array is going so this elements array is

[36:56] going to be defined at the class level and this is going to allow us to access it um access it as like an instate

[37:01] memory variable as the very beginning of this video di showed us how we could use a counter it's going to be basically the

[37:07] same concept but during the Constructor when this class is instantiated the first time we're going to block concurrency and we are going to go to

[37:13] storage and we're going to get all the elements and then we're going to default it to an empty array if you know there are no elements previously saved and

[37:20] then what we're going to be able to do is whenever we receive a websocket message and we broadcast that state back

[37:27] to the client we can have an additional check so we're basically at this point we've already you know responded to that user and then

[37:33] we're going to continue processing a little bit and we're going to do a little check um there's probably some ways to make this a little bit more

[37:38] clean but for the purpose of this of time it's just we're going to check if the message is is a string because it also could be an array buffer which I

[37:44] guess I could technically Define it as only a string we wouldn't have to do this check and then what we're going to do is I have this buffer event which is

[37:51] just kind of like a type a schema a Zod schema representing all of the different data types that are sent to this system

[37:58] and if it is an element change type then what we're going to do is we're going to update the elements um and then we are

[38:04] going to flush that data to the storage so with that being said if you've made it this far into the video I just wanted

[38:10] to introduce an idea that I've had the last few weeks so I've had a number of different people reach out and say like hey like can you create a course or can

[38:15] you make longer form content and you know like I really I I don't love making like super long content I don't think it

[38:21] does super well on YouTube and like I also just don't think most people have the attention span to like make it through a video like this but if you are

[38:27] somebody like once it's like really in-depth Hands-On but still somewhat fast-paced content I'm considering I'm

[38:32] considering actually making like a full-fledged course to go through like building really comprehensive uis and you know actual series production ready

[38:38] backend services with like you know cicd pipelines and versioning and um building

[38:43] actual data systems on top of like cues and workflows and you know there's so many different like angles that I could

[38:49] go if I were to create a course because I'm building a lot of different stuff for different clients and I do think that there's kind of a hole in in the

[38:54] market of like people that have built serious things on top of Cloud flare and there's really not a ton of people teaching it so I'm considering making

[39:01] this course I'm like I'm not committing to it I just I just want to see like if there's enough interest so if you're interested go ahead and leave your email

[39:06] I'm not going to spam or reach out like a bunch it's just maybe I'll send out an email like you know what type of content is going to be interesting and you know

[39:12] if I'm if I get a lot of people that are really interested in the course then I think it could be worth my time I'm going to go ahead and move forward with

[39:18] it so yeah if you're interested go ahead and sign up and yeah that's all for this one see you

# Source Code Context

Generated on: 2025-06-29T09:11:49+08:00

## Repository Overview
- Total Files: 6
- Total Size: 79069 bytes

## Directory Structure
```
auth-implementation-qpb0x8.md
cloudflare-workers-guide-i58l3d.md
d1-database-setup-for-classifieds-app-a0m502.md
git-commit-message-guidelines-o8ehd2.md
shadcn-ui-tailwind-v4-7z8p3v.md
the-standard-of-code-review-4vqfbn.md

```

## File Contents


### File: auth-implementation-qpb0x8.md

```markdown
# Adding Authentication to the Project

## Step 1: Install Dependencies
```bash
npm install better-auth
```

## Step 2: Configure Database Schema
Add authentication tables to your schema file (`src/lib/schema.ts`):
- `users` - Store user information
- `accounts` - Manage login methods and credentials
- `sessions` - Track active login sessions
- `verifications` - Handle email verification tokens

```ts
import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: 'boolean' }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: 'timestamp' }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

## Step 3: Set Up Better Auth

The auth instance is created based on env.

1. Create `src/lib/auth.ts` to configure the auth provider:
   ```typescript
   import { betterAuth } from "better-auth";
   import { drizzleAdapter } from "better-auth/adapters/drizzle";
   import { Env, getDb } from "@/server/db";
   import { users, accounts, sessions, verifications } from "@/lib/schema";

   export const getAuth = (env: Env) => {
     return betterAuth({
       database: drizzleAdapter(getDb(env), {
         provider: "sqlite",
         schema: {
           user: users,
           account: accounts,
           session: sessions,
           verification: verifications
         }
       }),
       emailAndPassword: {
         enabled: true,
       },
       // Uncomment to enable social login
       // socialProviders: {
       //   github: {
       //     clientId: process.env.GITHUB_CLIENT_ID as string,
       //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
       //   },
       // }
     });
   };
   ```

2. Create authentication middleware (`src/server/middleware.ts`):
   ```typescript
   import { getAuth } from "@/lib/auth";

   export const authMiddleware = async (c, next) => {
     const auth = getAuth(c.env);
     const session = await auth.api.getSession(c.req.raw);

     if (!session && c.req.method === "POST") {
       return c.json({ error: "Unauthorized" }, 401);
     }

     c.set("session", session);
     await next();
   };
   ```

3. Configure auth routes in main server file (`src/server/index.tsx`):
   ```typescript
   app.on(["POST", "GET"], "/api/auth/*", async (c) => {
     const auth = getAuth(c.env);
     return auth.handler(c.req.raw);
   });
   ```

4. Protect routes with middleware:
   ```typescript
   app.use("/api/listings", authMiddleware);
   ```

## Step 4: Set Up Client-Side Auth Utilities
Create `src/lib/auth-client.ts`:
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({});

export const {
  signIn,
  signUp,
  signOut,
  useSession
} = authClient;
```

## Step 5: Implement Auth UI Components
1. Create login and signup forms using the exported functions
2. Add authentication state to your app layout
3. Implement protected routes for authenticated content

## Step 6: Update Environment Variables
Add any required auth-related environment variables (for social providers, etc.)
```



### File: cloudflare-workers-guide-i58l3d.md

```markdown
<system_context>
You are an advanced assistant specialized in generating Cloudflare Workers code. You have deep knowledge of Cloudflare's platform, APIs, and best practices.
</system_context>

<behavior_guidelines>

- Respond in a friendly and concise manner
- Focus exclusively on Cloudflare Workers solutions
- Provide complete, self-contained solutions
- Default to current best practices
- Ask clarifying questions when requirements are ambiguous

</behavior_guidelines>

<code_standards>

- Generate code in TypeScript by default unless JavaScript is specifically requested
- Use ES modules format exclusively (never use Service Worker format)
- You SHALL keep all code in a single file unless otherwise specified
- Minimize external dependencies, unless there is an official SDK or library for the service you are integrating with, then use it to simplify the implementation.
- Do not use libraries that have FFI/native/C bindings.
- Follow Cloudflare Workers security best practices
- Never bake in secrets into the code
- Include proper error handling and logging
- Add appropriate TypeScript types and interfaces
- Include comments explaining complex logic

</code_standards>

<output_format>

- Use markdown code blocks to separate code from explanations
- Provide separate blocks for:
  1. Main worker code (index.ts/index.js)
  2. Configuration (wrangler.jsonc)
  3. Type definitions (if applicable)
  4. Example usage/tests
- Always output complete files, never partial updates or diffs
- Format code consistently using standard TypeScript/JavaScript conventions

</output_format>

<cloudflare_integrations>

- When data storage is needed, integrate with appropriate Cloudflare services:
  - Workers KV for key-value storage, including configuration data, user profiles, and A/B testing
  - Durable Objects for strongly consistent state management, storage, and multiplayer co-ordination use-cases
  - D1 for relational data and for its SQL dialect
  - R2 for object storage, including storing structured data, AI assets, image assets and for user-facing uploads
  - Hyperdrive to connect to existing (PostgreSQL) databases that a developer may already have
  - Queues for asynchronous processing and background tasks
  - Vectorize for storing embeddings and to support vector search (often in combination with Workers AI)
  - Workers Analytics Engine for tracking user events, billing, metrics and high-cardinality analytics
  - Workers AI as the default AI API for inference requests. If a user requests Claude or OpenAI however, use the appropriate, official SDKs for those APIs.
  - Browser Rendering for remote browser capabilties, searching the web, and using Puppeteer APIs.
  - Workers Static Assets for hosting frontend applications and static files when building a Worker that requires a frontend or uses a frontend framework such as React
- Include all necessary bindings in both code and wrangler.jsonc
- Add appropriate environment variable definitions

</cloudflare_integrations>

<configuration_requirements>

- Always provide a wrangler.jsonc (not wrangler.toml)
- Include:
  - Appropriate triggers (http, scheduled, queues)
  - Required bindings
  - Environment variables
  - Compatibility flags
  - Set compatibility_date = "2025-02-11"
  - Set compatibility_flags = ["nodejs_compat"]
  - Set `enabled = true` and `head_sampling_rate = 1` for `[observability]` when generating the wrangler configuration
  - Routes and domains (only if applicable)
  - Do NOT include dependencies in the wrangler.jsonc file
  - Only include bindings that are used in the code

<example id="wrangler.jsonc">
<code language="jsonc">
// wrangler.jsonc
{
  "name": "app-name-goes-here", // name of the app
  "main": "src/index.ts", // default file
  "compatibility_date": "2025-02-11",
  "compatibility_flags": ["nodejs_compat"], // Enable Node.js compatibility
  "observability": {
    // Enable logging by default
    "enabled": true,
   }
}
</code>
</example>
<key_points>

  - Defines a name for the app the user is building
  - Sets `src/index.ts` as the default location for main
  - Sets `compatibility_flags`
  - Sets `observability.enabled = true`

</key_points>
</example>
</configuration_requirements>

<security_guidelines>

- Implement proper request validation
- Use appropriate security headers
- Handle CORS correctly when needed
- Implement rate limiting where appropriate
- Follow least privilege principle for bindings
- Sanitize user inputs

</security_guidelines>

<testing_guidance>

- Include basic test examples
- Provide curl commands for API endpoints
- Add example environment variable values
- Include sample requests and responses

</testing_guidance>

<performance_guidelines>

- Optimize for cold starts
- Minimize unnecessary computation
- Use appropriate caching strategies
- Consider Workers limits and quotas
- Implement streaming where beneficial

</performance_guidelines>

<error_handling>

- Implement proper error boundaries
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors appropriately
- Handle edge cases gracefully

</error_handling>

<websocket_guidelines>

- Always use WebSocket Hibernation API instead of legacy WebSocket API unless otherwise specified
- You SHALL use the Durable Objects WebSocket Hibernation API when providing WebSocket handling code within a Durable Object. - Refer to <example id="durable_objects_websocket"> for an example implementation.
- Use `this.ctx.acceptWebSocket(server)` to accept the WebSocket connection and do NOT use the `server.accept()` method.
- Define an `async webSocketMessage()` handler that is invoked when a message is received from the client
- Define an `async webSocketClose()` handler that is invoked when the WebSocket connection is closed
- Do NOT use the `addEventListener` pattern to handle WebSocket events.
- Handle WebSocket upgrade requests explicitly

</websocket_guidelines>

<code_examples>

<example id="durable_objects_websocket">
<description>
Example of using the Hibernatable WebSocket API in Durable Objects to handle WebSocket connections.
</description>

<code language="typescript">
import { DurableObject } from "cloudflare:workers";

interface Env {
WEBSOCKET_HIBERNATION_SERVER: DurableObject<Env>;
}

// Durable Object
export class WebSocketHibernationServer extends DurableObject {
async fetch(request) {
// Creates two ends of a WebSocket connection.
const webSocketPair = new WebSocketPair();
const [client, server] = Object.values(webSocketPair);

    // Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
    // request within the Durable Object. It has the effect of "accepting" the connection,
    // and allowing the WebSocket to send and receive messages.
    // Unlike `ws.accept()`, `state.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
    // is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
    // the connection is open. During periods of inactivity, the Durable Object can be evicted
    // from memory, but the WebSocket connection will remain open. If at some later point the
    // WebSocket receives a message, the runtime will recreate the Durable Object
    // (run the `constructor`) and deliver the message to the appropriate handler.
    this.ctx.acceptWebSocket(server);

    return new Response(null, {
          status: 101,
          webSocket: client,
    });

    },

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void | Promise<void> {
     // Upon receiving a message from the client, reply with the same message,
     // but will prefix the message with "[Durable Object]: " and return the
     // total number of connections.
     ws.send(
     `[Durable Object] message: ${message}, connections: ${this.ctx.getWebSockets().length}`,
     );
    },

    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) void | Promise<void> {
     // If the client closes the connection, the runtime will invoke the webSocketClose() handler.
     ws.close(code, "Durable Object is closing WebSocket");
    },

    async webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
     console.error("WebSocket error:", error);
     ws.close(1011, "WebSocket error");
    }

}

</code>

<configuration>
{
  "name": "websocket-hibernation-server",
  "durable_objects": {
    "bindings": [
      {
        "name": "WEBSOCKET_HIBERNATION_SERVER",
        "class_name": "WebSocketHibernationServer"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["WebSocketHibernationServer"]
    }
  ]
}
</configuration>

<key_points>

- Uses the WebSocket Hibernation API instead of the legacy WebSocket API
- Calls `this.ctx.acceptWebSocket(server)` to accept the WebSocket connection
- Has a `webSocketMessage()` handler that is invoked when a message is received from the client
- Has a `webSocketClose()` handler that is invoked when the WebSocket connection is closed
- Does NOT use the `server.addEventListener` API unless explicitly requested.
- Don't over-use the "Hibernation" term in code or in bindings. It is an implementation detail.
  </key_points>
  </example>

<example id="durable_objects_alarm_example">
<description>
Example of using the Durable Object Alarm API to trigger an alarm and reset it.
</description>

<code language="typescript">
import { DurableObject } from "cloudflare:workers";

interface Env {
ALARM_EXAMPLE: DurableObject<Env>;
}

export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    let userId = url.searchParams.get("userId") || crypto.randomUUID();
    let id = env.ALARM_EXAMPLE.idFromName(userId);
    return await env.ALARM_EXAMPLE.get(id).fetch(request);
  },
};

const SECONDS = 1000;

export class AlarmExample extends DurableObject {
constructor(ctx, env) {
this.ctx = ctx;
this.storage = ctx.storage;
}
async fetch(request) {
// If there is no alarm currently set, set one for 10 seconds from now
let currentAlarm = await this.storage.getAlarm();
if (currentAlarm == null) {
this.storage.setAlarm(Date.now() + 10 \_ SECONDS);
}
}
async alarm(alarmInfo) {
// The alarm handler will be invoked whenever an alarm fires.
// You can use this to do work, read from the Storage API, make HTTP calls
// and set future alarms to run using this.storage.setAlarm() from within this handler.
if (alarmInfo?.retryCount != 0) {
console.log("This alarm event has been attempted ${alarmInfo?.retryCount} times before.");
}

// Set a new alarm for 10 seconds from now before exiting the handler
this.storage.setAlarm(Date.now() + 10 \_ SECONDS);
}
}

</code>

<configuration>
{
  "name": "durable-object-alarm",
  "durable_objects": {
    "bindings": [
      {
        "name": "ALARM_EXAMPLE",
        "class_name": "DurableObjectAlarm"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["DurableObjectAlarm"]
    }
  ]
}
</configuration>

<key_points>

- Uses the Durable Object Alarm API to trigger an alarm
- Has a `alarm()` handler that is invoked when the alarm is triggered
- Sets a new alarm for 10 seconds from now before exiting the handler
  </key_points>
  </example>

<example id="kv_session_authentication_example">
<description>
Using Workers KV to store session data and authenticate requests, with Hono as the router and middleware.
</description>

<code language="typescript">
// src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface Env {
AUTH_TOKENS: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>()

// Add CORS middleware
app.use('\*', cors())

app.get('/', async (c) => {
try {
// Get token from header or cookie
const token = c.req.header('Authorization')?.slice(7) ||
c.req.header('Cookie')?.match(/auth_token=([^;]+)/)?.[1];
if (!token) {
return c.json({
authenticated: false,
message: 'No authentication token provided'
}, 403)
}

    // Check token in KV
    const userData = await c.env.AUTH_TOKENS.get(token)

    if (!userData) {
      return c.json({
        authenticated: false,
        message: 'Invalid or expired token'
      }, 403)
    }

    return c.json({
      authenticated: true,
      message: 'Authentication successful',
      data: JSON.parse(userData)
    })

} catch (error) {
console.error('Authentication error:', error)
return c.json({
authenticated: false,
message: 'Internal server error'
}, 500)
}
})

export default app
</code>

<configuration>
{
  "name": "auth-worker",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-11",
  "kv_namespaces": [
    {
      "binding": "AUTH_TOKENS",
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "preview_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  ]
}
</configuration>

<key_points>

- Uses Hono as the router and middleware
- Uses Workers KV to store session data
- Uses the Authorization header or Cookie to get the token
- Checks the token in Workers KV
- Returns a 403 if the token is invalid or expired

</key_points>
</example>

<example id="queue_producer_consumer_example">
<description>
Use Cloudflare Queues to produce and consume messages.
</description>

<code language="typescript">
// src/producer.ts
interface Env {
  REQUEST_QUEUE: Queue;
  UPSTREAM_API_URL: string;
  UPSTREAM_API_KEY: string;
}

export default {
async fetch(request: Request, env: Env) {
const info = {
timestamp: new Date().toISOString(),
method: request.method,
url: request.url,
headers: Object.fromEntries(request.headers),
};
await env.REQUEST_QUEUE.send(info);

return Response.json({
message: 'Request logged',
requestId: crypto.randomUUID()
});

},

async queue(batch: MessageBatch<any>, env: Env) {
const requests = batch.messages.map(msg => msg.body);

    const response = await fetch(env.UPSTREAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.UPSTREAM_API_KEY}`
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        batchSize: requests.length,
        requests
      })
    });

    if (!response.ok) {
      throw new Error(`Upstream API error: ${response.status}`);
    }

}
};

</code>

<configuration>
{
  "name": "request-logger-consumer",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-11",
  "queues": {
        "producers": [{
      "name": "request-queue",
      "binding": "REQUEST_QUEUE"
    }],
    "consumers": [{
      "name": "request-queue",
      "dead_letter_queue": "request-queue-dlq",
      "retry_delay": 300
    }]
  },
  "vars": {
    "UPSTREAM_API_URL": "https://api.example.com/batch-logs",
    "UPSTREAM_API_KEY": ""
  }
}
</configuration>

<key_points>

- Defines both a producer and consumer for the queue
- Uses a dead letter queue for failed messages
- Uses a retry delay of 300 seconds to delay the re-delivery of failed messages
- Shows how to batch requests to an upstream API

</key_points>
</example>

<example id="hyperdrive_connect_to_postgres">
<description>
Connect to and query a Postgres database using Cloudflare Hyperdrive.
</description>

<code language="typescript">
// Postgres.js 3.4.5 or later is recommended
import postgres from "postgres";

export interface Env {
// If you set another name in the Wrangler config file as the value for 'binding',
// replace "HYPERDRIVE" with the variable name you defined.
HYPERDRIVE: Hyperdrive;
}

export default {
async fetch(request, env, ctx): Promise<Response> {
console.log(JSON.stringify(env));
// Create a database client that connects to your database via Hyperdrive.
//
// Hyperdrive generates a unique connection string you can pass to
// supported drivers, including node-postgres, Postgres.js, and the many
// ORMs and query builders that use these drivers.
const sql = postgres(env.HYPERDRIVE.connectionString)

    try {
      // Test query
      const results = await sql`SELECT * FROM pg_tables`;

      // Clean up the client, ensuring we don't kill the worker before that is
      // completed.
      ctx.waitUntil(sql.end());

      // Return result rows as JSON
      return Response.json(results);
    } catch (e) {
      console.error(e);
      return Response.json(
        { error: e instanceof Error ? e.message : e },
        { status: 500 },
      );
    }

},
} satisfies ExportedHandler<Env>;

</code>

<configuration>
{
  "name": "hyperdrive-postgres",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-11",
  "hyperdrive": [
    {
      "binding": "HYPERDRIVE",
      "id": "<YOUR_DATABASE_ID>"
    }
  ]
}
</configuration>

<usage>
// Install Postgres.js
npm install postgres

// Create a Hyperdrive configuration
npx wrangler hyperdrive create <YOUR_CONFIG_NAME> --connection-string="postgres://user:password@HOSTNAME_OR_IP_ADDRESS:PORT/database_name"

</usage>

<key_points>

- Installs and uses Postgres.js as the database client/driver.
- Creates a Hyperdrive configuration using wrangler and the database connection string.
- Uses the Hyperdrive connection string to connect to the database.
- Calling `sql.end()` is optional, as Hyperdrive will handle the connection pooling.

</key_points>
</example>

<example id="workflows">
<description>
Using Workflows for durable execution, async tasks, and human-in-the-loop workflows.
</description>

<code language="typescript">
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

type Env = {
// Add your bindings here, e.g. Workers KV, D1, Workers AI, etc.
MY_WORKFLOW: Workflow;
};

// User-defined params passed to your workflow
type Params = {
email: string;
metadata: Record<string, string>;
};

export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
// Can access bindings on `this.env`
// Can access params on `event.payload`
const files = await step.do('my first step', async () => {
// Fetch a list of files from $SOME_SERVICE
return {
files: [
'doc_7392_rev3.pdf',
'report_x29_final.pdf',
'memo_2024_05_12.pdf',
'file_089_update.pdf',
'proj_alpha_v2.pdf',
'data_analysis_q2.pdf',
'notes_meeting_52.pdf',
'summary_fy24_draft.pdf',
],
};
});

    const apiResponse = await step.do('some other step', async () => {
      let resp = await fetch('https://api.cloudflare.com/client/v4/ips');
      return await resp.json<any>();
    });

    await step.sleep('wait on something', '1 minute');

    await step.do(
      'make a call to write that could maybe, just might, fail',
      // Define a retry strategy
      {
        retries: {
          limit: 5,
          delay: '5 second',
          backoff: 'exponential',
        },
        timeout: '15 minutes',
      },
      async () => {
        // Do stuff here, with access to the state from our previous steps
        if (Math.random() > 0.5) {
          throw new Error('API call to $STORAGE_SYSTEM failed');
        }
      },
    );

}
}

export default {
async fetch(req: Request, env: Env): Promise<Response> {
let url = new URL(req.url);

    if (url.pathname.startsWith('/favicon')) {
      return Response.json({}, { status: 404 });
    }

    // Get the status of an existing instance, if provided
    let id = url.searchParams.get('instanceId');
    if (id) {
      let instance = await env.MY_WORKFLOW.get(id);
      return Response.json({
        status: await instance.status(),
      });
    }

    const data = await req.json()

    // Spawn a new instance and return the ID and status
    let instance = await env.MY_WORKFLOW.create({
      // Define an ID for the Workflow instance
      id: crypto.randomUUID(),
       // Pass data to the Workflow instance
      // Available on the WorkflowEvent
       params: data,
    });

    return Response.json({
      id: instance.id,
      details: await instance.status(),
    });

},
};

</code>

<configuration>
{
  "name": "workflows-starter",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-11",
  "workflows": [
    {
      "name": "workflows-starter",
      "binding": "MY_WORKFLOW",
      "class_name": "MyWorkflow"
    }
  ]
}
</configuration>

<key_points>

- Defines a Workflow by extending the WorkflowEntrypoint class.
- Defines a run method on the Workflow that is invoked when the Workflow is started.
- Ensures that `await` is used before calling `step.do` or `step.sleep`
- Passes a payload (event) to the Workflow from a Worker
- Defines a payload type and uses TypeScript type arguments to ensure type safety

</key_points>
</example>

<example id="workers_analytics_engine">
<description>
 Using Workers Analytics Engine for writing event data.
</description>

<code language="typescript">
interface Env {
 USER_EVENTS: AnalyticsEngineDataset;
}

export default {
async fetch(req: Request, env: Env): Promise<Response> {
let url = new URL(req.url);
let path = url.pathname;
let userId = url.searchParams.get("userId");

     // Write a datapoint for this visit, associating the data with
     // the userId as our Analytics Engine 'index'
     env.USER_EVENTS.writeDataPoint({
      // Write metrics data: counters, gauges or latency statistics
      doubles: [],
      // Write text labels - URLs, app names, event_names, etc
      blobs: [path],
      // Provide an index that groups your data correctly.
      indexes: [userId],
     });

     return Response.json({
      hello: "world",
     });
    ,

};

</code>

<configuration>
{
  "name": "analytics-engine-example",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-11",
  "analytics_engine_datasets": [
      {
        "binding": "<BINDING_NAME>",
        "dataset": "<DATASET_NAME>"
      }
    ]
  }
}
</configuration>

<usage>
// Query data within the 'temperatures' dataset
// This is accessible via the REST API at https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics_engine/sql
SELECT
    timestamp,
    blob1 AS location_id,
    double1 AS inside_temp,
    double2 AS outside_temp
FROM temperatures
WHERE timestamp > NOW() - INTERVAL '1' DAY

// List the datasets (tables) within your Analytics Engine
curl "<https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics_engine/sql>" \
--header "Authorization: Bearer <API_TOKEN>" \
--data "SHOW TABLES"

</usage>

<key_points>

- Binds an Analytics Engine dataset to the Worker
- Uses the `AnalyticsEngineDataset` type when using TypeScript for the binding
- Writes event data using the `writeDataPoint` method and writes an `AnalyticsEngineDataPoint`
- Does NOT `await` calls to `writeDataPoint`, as it is non-blocking
- Defines an index as the key representing an app, customer, merchant or tenant.
- Developers can use the GraphQL or SQL APIs to query data written to Analytics Engine
  </key_points>
  </example>

<example id="browser_rendering_workers">
<description>
Use the Browser Rendering API as a headless browser to interact with websites from a Cloudflare Worker.
</description>

<code language="typescript">
import puppeteer from "@cloudflare/puppeteer";

interface Env {
  BROWSER_RENDERING: Fetcher;
}

export default {
  async fetch(request, env): Promise<Response> {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get("url");

    if (url) {
      url = new URL(url).toString(); // normalize
      const browser = await puppeteer.launch(env.MYBROWSER);
      const page = await browser.newPage();
      await page.goto(url);
      // Parse the page content
      const content = await page.content();
      // Find text within the page content
      const text = await page.$eval("body", (el) => el.textContent);
      // Do something with the text
      // e.g. log it to the console, write it to KV, or store it in a database.
      console.log(text);

      // Ensure we close the browser session
      await browser.close();

      return Response.json({
        bodyText: text,
      })
    } else {
      return Response.json({
          error: "Please add an ?url=https://example.com/ parameter"
      }, { status: 400 })
    }
  },
} satisfies ExportedHandler<Env>;
</code>

<configuration>
{
  "name": "browser-rendering-example",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-11",
  "browser": [
    {
      "binding": "BROWSER_RENDERING",
    }
  ]
}
</configuration>

<usage>
// Install @cloudflare/puppeteer
npm install @cloudflare/puppeteer --save-dev
</usage>

<key_points>

- Configures a BROWSER_RENDERING binding
- Passes the binding to Puppeteer
- Uses the Puppeteer APIs to navigate to a URL and render the page
- Parses the DOM and returns context for use in the response
- Correctly creates and closes the browser instance

</key_points>
</example>

<example id="static-assets">
<code language="typescript">
// src/index.ts

interface Env {
  ASSETS: Fetcher;
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
</code>
<configuration>
{
  "name": "my-app",
  "main": "src/index.ts",
  "compatibility_date": "<TBD>",
  "assets": { "directory": "./public/", "not_found_handling": "single-page-application", "binding": "ASSETS" },
  "observability": {
    "enabled": true
  }
}
</configuration>
<key_points>
- Configures a ASSETS binding
- Uses /public/ as the directory the build output goes to from the framework of choice
- The Worker will handle any requests that a path cannot be found for and serve as the API
- If the application is a single-page application (SPA), HTTP 404 (Not Found) requests will direct to the SPA.

</key_points>
</example>

</code_examples>

<api_patterns>

<pattern id="websocket_coordination">
<description>
Fan-in/fan-out for WebSockets. Uses the Hibernatable WebSockets API within Durable Objects. Does NOT use the legacy addEventListener API.
</description>
<implementation>
export class WebSocketHibernationServer extends DurableObject {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Creates two ends of a WebSocket connection.
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Call this to accept the WebSocket connection.
    // Do NOT call server.accept() (this is the legacy approach and is not preferred)
    this.ctx.acceptWebSocket(server);

    return new Response(null, {
          status: 101,
          webSocket: client,
    });
},

async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void | Promise<void> {
  // Invoked on each WebSocket message.
  ws.send(message)
},

async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) void | Promise<void> {
  // Invoked when a client closes the connection.
  ws.close(code, "<message>");
},

async webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
  // Handle WebSocket errors
}
}
</implementation>
</pattern>
</api_patterns>

<user_prompt>
{user_prompt}
</user_prompt>
```



### File: d1-database-setup-for-classifieds-app-a0m502.md

```markdown
Please study the existing codebase carefully and implement a D1 database setup as described in "Database Setup Implementation Plan" below. List out all the individual steps as bullets before starting.

Instead of the chat example described, we want to make a classifieds app where users can submit (without authentication) a listing with a title, description, location and phone number. 

Complete the entire flow of implementation, migrations and initial deployment. 

# Database Setup Implementation Plan

## Database Setup with Drizzle

### 1. Project Structure
```
/
├── src/
│   ├── server/
│   │   ├── index.tsx     # Main worker code with Hono routes
│   │   ├── renderer.tsx  # React SSR shell
│   │   └── db.ts         # Database operations (to be created)
│   ├── client/
│   │   ├── app.tsx       # Client-side React app
│   │   └── index.tsx     # Client entry point
│   ├── lib/
│   │   ├── utils.ts      # Utility functions
│   │   └── schema.ts     # Drizzle schema definitions (to be created)
│   └── style.css         # Global styles
├── migrations/           # SQL migration files
├── drizzle/              # Generated Drizzle artifacts
├── drizzle.config.ts     # Drizzle configuration (to be created)
├── wrangler.jsonc        # Cloudflare configuration
└── vite.config.ts        # Vite configuration
```

### 2. Database Schema (src/lib/schema.ts)
```typescript
import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### 3. Drizzle Configuration (drizzle.config.ts)
```typescript
import type { Config } from 'drizzle-kit';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
});
```

### 4. Wrangler Configuration Update (wrangler.jsonc)

When choosing a database name, append a random 6-character string to make it unique.

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "chat-app",
  "compatibility_date": "2025-03-20",
  "main": "./src/server/index.tsx",
  "assets": {
    "directory": "dist"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "chat-db",
      "database_id": "<your-database-id>",
      "migrations_dir": "drizzle"
    }
  ]
}
```

### 5. Database Operations (src/server/db.ts)
```typescript
import { drizzle } from 'drizzle-orm/d1';
import { messages } from '@/lib/schema';

export interface Env {
  DB: D1Database;
}

export const getDb = (env: Env) => drizzle(env.DB);

export async function getMessages(env: Env) {
  const db = getDb(env);
  return await db.select().from(messages).all();
}

export async function createMessage(env: Env, content: string) {
  const db = getDb(env);
  return await db.insert(messages).values({ content }).run();
}
```

### 6. Implementation Steps

#### A. Initial Setup
1. Create D1 database:
```bash
wrangler d1 create chat-db
```

2. Install dependencies:
```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

3. Update the worker environment interface in src/server/index.tsx:
```typescript
import { Hono } from 'hono'
import { renderer } from './renderer'
import { getMessages, createMessage } from './db'

// Define the environment interface
interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>()

// Add API routes and existing code
// ...
```

#### B. Database Schema Management
To manage your database schema using drizzle-kit and wrangler:

1. Create the schema in `src/lib/schema.ts`
2. Generate migration SQL files:
```bash
npx drizzle-kit generate
```

This command will:
- Read your Drizzle schema file
- Compare it with the previous schema version
- Generate SQL migration files in the `migrations` directory

3. Apply migrations to local development database:
```bash
npx wrangler d1 migrations apply chat-db --local
```

4. Apply migrations to production database:
```bash
npx wrangler d1 migrations apply chat-db --remote
```

For development, you can use additional flags with drizzle-kit generate:
```bash
npx drizzle-kit generate --verbose  # Show detailed output
```

#### C. Worker Implementation
1. Update the main worker (src/server/index.tsx) with:
   - GET /api/messages endpoint to fetch messages
   - POST /api/messages endpoint to create new messages
   - Update the renderer to display messages

2. Update the client-side React app (src/client/app.tsx) with:
   - Message display component
   - Text input for new messages
   - Send button
   - Auto-refresh functionality

### 7. Testing and Deployment

1. Test locally:
```bash
npm run dev
```

2. Deploy to production:
```bash
npm run deploy
```

### 8. Continous Integration

Create a Github action to run migrations, based on this code snippet:
```
      - name: Apply D1 Migrations
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: d1 migrations apply ${{ secrets.CF_DB_NAME }}
````

### 9. Documentation

Add a "Database" section to the README file, describing how the schema can be updated, how migrations are generated and applied to the local and remote databases.

Keep the changes in the README focused on the database changes we just did and focus on useful information for further development. Don't replicate the schema.

Include a small section on resetting the local DB, which can be done with this command:

```
rm .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*
```

Extend package.json with the most important commands that a user might want to run.

## Notes

- Drizzle provides type-safe database operations
- The application uses Hono for routing and React for UI
- Server-side rendering (SSR) is used for the initial page load
- Client-side hydration makes the app interactive
- Schema changes are tracked by generating migration files
- Migration files can be committed to version control
- Wrangler applies migrations to both local and remote D1 databases
- Always test schema changes in a development environment first
```



### File: git-commit-message-guidelines-o8ehd2.md

```markdown
## Git Commit Message Format

```
<type>[scope]: <description>

[body]

[footer]
```

## Types
`feat` (feature), `fix` (bugfix), `docs` (documentation), `style` (formatting), `refactor`, `perf` (performance), `test`, `build`, `ci`, `chore` (maintenance), `revert`

## Guidelines
- Description: imperative, lowercase, no period, ≤50 chars
- Body: explain WHY, not HOW, wrap at 72 chars
- Footer: reference issues (`Fixes #123`), breaking changes (`BREAKING CHANGE: description`)

## Examples
```
feat(auth): implement SSO functionality
```

```
fix(api): prevent timeout on large requests

Increased request timeout and implemented streaming response.
Fixes #422
```

Commit should be atomic, specific, and focus on WHAT changed in subject line with WHY explained in body when needed.

## Git Commit Practices
- Use semantic commit messages following the format in the Git Commit Message Format memory
- Commits should be atomic, focusing on specific changes
- NEVER create separate files (e.g., commit-message.txt or COMMIT_MESSAGE.md) for drafting commit messages
- When committing, use the git commit command directly with the -m flag:
  ```bash
  git commit -m "type(scope): description" -m "additional details"
  ```
- Keep commit messages concise but descriptive
```



### File: shadcn-ui-tailwind-v4-7z8p3v.md

```markdown
# shadcn/ui with Tailwind v4 Design System Guidelines

This document outlines design principles and implementation guidelines for applications using shadcn/ui with Tailwind v4. These guidelines ensure consistency, accessibility, and best practices throughout the UI development process.

## Core Design Principles

### 1. Typography System: 4 Sizes, 2 Weights
- **4 Font Sizes Only**:
  - Size 1: Large headings
  - Size 2: Subheadings/Important content
  - Size 3: Body text
  - Size 4: Small text/labels
- **2 Font Weights Only**:
  - Semibold: For headings and emphasis
  - Regular: For body text and general content
- **Consistent Hierarchy**: Maintain clear visual hierarchy with limited options

### 2. 8pt Grid System
- **All spacing values must be divisible by 8 or 4**
- **Examples**:
  - Instead of 25px padding → Use 24px (divisible by 8)
  - Instead of 11px margin → Use 12px (divisible by 4)
- **Consistent Rhythm**: Creates visual harmony throughout the interface

### 3. 60/30/10 Color Rule
- **60%**: Neutral color (white/light gray)
- **30%**: Complementary color (dark gray/black)
- **10%**: Main brand/accent color (e.g., red, blue)
- **Color Balance**: Prevents visual stress while maintaining hierarchy

### 4. Clean Visual Structure
- **Logical Grouping**: Related elements should be visually connected
- **Deliberate Spacing**: Spacing between elements should follow the grid system
- **Alignment**: Elements should be properly aligned within their containers
- **Simplicity Over Flashiness**: Focus on clarity and function first

## Foundation

### Tailwind v4 Integration
- **Use Tailwind CSS v4 for styling**: Leverage the latest Tailwind features including the new @theme directive, dynamic utility values, and OKLCH colors. [Tailwind CSS v4 Documentation](mdc:https://tailwindcss.com/docs)
- **Modern browsing features**: Tailwind v4 uses bleeding-edge browser features and is designed for modern browsers.
- **Simplified installation**: Fewer dependencies, zero configuration required in many cases.
- **shadcn/ui v4 demo**: Reference the demo site for component examples. [shadcn/ui v4 Demo](mdc:https://v4.shadcn.com/)

### New CSS Structure
- **Replace @layer base with @theme directive**:
  ```css
  /* Old approach in v3 */
  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 0 0% 3.9%;
    }
  }
  
  /* New approach in v4 */
  @theme {
    --color-background: hsl(var(--background));
    --color-foreground: hsl(var(--foreground));
  }
  ```
- **Tailwind imports**: Use `@import "tailwindcss"` instead of `@tailwind base`
- **Container queries**: Built-in support without plugins
- **OKLCH color format**: Updated from HSL for better color perception

## Typography System

### Font Sizes & Weights
- **Strictly limit to 4 distinct sizes**:
  - Size 1: Large headings (largest)
  - Size 2: Subheadings
  - Size 3: Body text
  - Size 4: Small text/labels (smallest)
- **Only use 2 font weights**:
  - Semibold: For headings and emphasis
  - Regular: For body text and most UI elements
- **Common mistakes to avoid**:
  - Using more than 4 font sizes
  - Introducing additional font weights
  - Inconsistent size application

### Typography Implementation
- **Reference shadcn's typography primitives** for consistent text styling
- **Use monospace variant** for numerical data when appropriate
- **data-slot attribute**: Every shadcn/ui primitive now has a data-slot attribute for styling
- **Maintain hierarchy** using consistent sizing patterns

## 8pt Grid System

### Spacing Guidelines
- **All spacing values MUST be divisible by 8 or 4**:
  - ✅ DO: Use 8, 16, 24, 32, 40, 48, etc.
  - ❌ DON'T: Use 25, 11, 7, 13, etc.

- **Practical examples**:
  - Instead of 25px padding → Use 24px (divisible by 8)
  - Instead of 11px margin → Use 12px (divisible by 4)
  - Instead of 15px gap → Use 16px (divisible by 8)

- **Use Tailwind's spacing utilities**:
  - p-4 (16px), p-6 (24px), p-8 (32px)
  - m-2 (8px), m-4 (16px), m-6 (24px)
  - gap-2 (8px), gap-4 (16px), gap-8 (32px)

- **Why this matters**:
  - Creates visual harmony
  - Simplifies decision-making
  - Establishes predictable patterns

### Implementation
- **Tailwind v4 dynamic spacing**: Spacing utilities accept any value without arbitrary syntax
- **Consistent component spacing**: Group related elements with matching gap values
- **Check responsive behavior**: Ensure grid system holds at all breakpoints

## 60/30/10 Color Rule

### Color Distribution
- **60%**: neutral color (bg-background)
  - Usually white or light gray in light mode
  - Dark gray or black in dark mode
  - Used for primary backgrounds, cards, containers

- **30%**: complementary color (text-foreground)
  - Usually dark gray or black in light mode
  - Light gray or white in dark mode
  - Used for text, icons, subtle UI elements

- **10%**: accent color (brand color)
  - Your primary brand color (red, blue, etc.)
  - Used sparingly for call-to-action buttons, highlights, important indicators
  - Avoid overusing to prevent visual stress

### Common Mistakes
- ❌ Overusing accent colors creates visual stress
- ❌ Not enough contrast between background and text
- ❌ Too many competing accent colors (stick to one primary accent)

### Implementation with shadcn/ui
- **Background/foreground convention**: Each component uses the background/foreground pattern
- **CSS variables in globals.css**:
  ```css
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    /* Additional variables */
  }
  
  @theme {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    /* Register other variables */
  }
  ```
- **OKLCH color format**: More accessible colors, especially in dark mode
- **Reserve accent colors** for important elements that need attention

## Component Architecture

### shadcn/ui Component Structure
- **2-layered architecture**:
  1. Structure and behavior layer (Radix UI primitives)
  2. Style layer (Tailwind CSS)
- **Class Variance Authority (CVA)** for variant styling
- **data-slot attribute** for styling component parts

### Implementation
- **Install components individually** using CLI (updated for v4) or manual installation
- **Component customization**: Modify components directly as needed
- **Radix UI primitives**: Base components for accessibility and behavior
- **New-York style**: Default recommended style for new projects (deprecated "default" style)

## Visual Hierarchy

### Design Principles
- **Simplicity over flashiness**: Focus on clarity and usability
- **Emphasis on what matters**: Highlight important elements
- **Reduced cognitive load**: Use consistent terminology and patterns
- **Visual connection**: Connect related UI elements through consistent patterns

### Implementation
- **Use shadcn/ui Blocks** for common UI patterns
- **Maintain consistent spacing** between related elements
- **Align elements properly** within containers
- **Logical grouping** of related functionality

## Installation & Setup

### Project Setup
- **CLI initialization**:
  ```bash
  npx create-next-app@latest my-app
  cd my-app
  npx shadcn-ui@latest init
  ```
- **Manual setup**: Follow the guide at [Manual Installation](mdc:https://ui.shadcn.com/docs/installation/manual)
- **components.json configuration**:
  ```json
  {
    "style": "new-york",
    "rsc": true,
    "tailwind": {
      "config": "",
      "css": "app/globals.css",
      "baseColor": "neutral",
      "cssVariables": true
    },
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils"
    }
  }
  ```

### Adding Components
- **Use the CLI**: `npx shadcn-ui@latest add button`
- **Install dependencies**: Required for each component
- **Find components**: [Component Reference](mdc:https://ui.shadcn.com/docs/components)

## Advanced Features

### Dark Mode
- **Updated dark mode colors** for better accessibility using OKLCH
- **Consistent contrast ratios** across light and dark themes
- **Custom variant**: `@custom-variant dark (&:is(.dark *))`

### Container Queries
- **Built-in support** without plugins
- **Responsive components** that adapt to their container size
- **@min-* and @max-* variants** for container query ranges

### Data Visualization
- **Chart components**: Use with consistent styling
- **Consistent color patterns**: Use chart-1 through chart-5 variables

## Experience Design

### Motion & Animation
- **Consider transitions** between screens and states
- **Animation purpose**: Enhance usability, not distract
- **Consistent motion patterns**: Similar elements should move similarly

### Implementation
- **Test experiences** across the entire flow
- **Design with animation in mind** from the beginning
- **Balance speed and smoothness** for optimal user experience

## Resources

- [shadcn/ui Documentation](mdc:https://ui.shadcn.com/docs)
- [Tailwind CSS v4 Documentation](mdc:https://tailwindcss.com/docs)
- [shadcn/ui GitHub Repository](mdc:https://github.com/shadcn/ui)
- [Tailwind v4 Upgrade Guide](mdc:https://tailwindcss.com/docs/upgrade-guide)
- [shadcn/ui v4 Demo](mdc:https://v4.shadcn.com/)
- [Figma Design System](mdc:https://www.figma.com/community/file/1203061493325953101/shadcn-ui-design-system)

## Code Review Checklist

### Core Design Principles
- [ ] Typography: Uses only 4 font sizes and 2 font weights (Semibold, Regular)
- [ ] Spacing: All spacing values are divisible by 8 or 4
- [ ] Colors: Follows 60/30/10 color distribution (60% neutral, 30% complementary, 10% accent)
- [ ] Structure: Elements are logically grouped with consistent spacing

### Technical Implementation
- [ ] Uses proper OKLCH color variables
- [ ] Leverages @theme directive for variables
- [ ] Components implement data-slot attribute properly
- [ ] Visual hierarchy is clear and consistent
- [ ] Components use Class Variance Authority for variants
- [ ] Dark mode implementation is consistent
- [ ] Accessibility standards are maintained (contrast, keyboard navigation, etc.)

### Common Issues to Flag
- [ ] Too many font sizes (more than 4)
- [ ] Inconsistent spacing values (not divisible by 8 or 4)
- [ ] Overuse of accent colors (exceeding 10%)
- [ ] Random or inconsistent margins/padding
- [ ] Insufficient contrast between text and background
- [ ] Unnecessary custom CSS when Tailwind utilities would suffice
```



### File: the-standard-of-code-review-4vqfbn.md

```markdown
<page>
  <title>The Standard of Code Review</title>
  <url>https://google.github.io/eng-practices/review/reviewer/standard.html</url>
  <content>
The primary purpose of code review is to make sure that the overall code health of the code base is improving over time. All of the tools and processes of code review are designed to this end.

In order to accomplish this, a series of trade-offs have to be balanced.

First, developers must be able to _make progress_ on their tasks. If you never submit an improvement to the codebase, then the codebase never improves. Also, if a reviewer makes it very difficult for _any_ change to go in, then developers are disincentivized to make improvements in the future.

On the other hand, it is the duty of the reviewer to make sure that each CL is of such a quality that the overall code health of their codebase is not decreasing as time goes on. This can be tricky, because often, codebases degrade through small decreases in code health over time, especially when a team is under significant time constraints and they feel that they have to take shortcuts in order to accomplish their goals.

Also, a reviewer has ownership and responsibility over the code they are reviewing. They want to ensure that the codebase stays consistent, maintainable, and all of the other things mentioned in ["What to look for in a code review."](https://google.github.io/eng-practices/review/reviewer/looking-for.html)

Thus, we get the following rule as the standard we expect in code reviews:

**In general, reviewers should favor approving a CL once it is in a state where it definitely improves the overall code health of the system being worked on, even if the CL isn't perfect.**

That is _the_ senior principle among all of the code review guidelines.

There are limitations to this, of course. For example, if a CL adds a feature that the reviewer doesn't want in their system, then the reviewer can certainly deny approval even if the code is well-designed.

A key point here is that there is no such thing as "perfect" code—there is only _better_ code. Reviewers should not require the author to polish every tiny piece of a CL before granting approval. Rather, the reviewer should balance out the need to make forward progress compared to the importance of the changes they are suggesting. Instead of seeking perfection, what a reviewer should seek is _continuous improvement_. A CL that, as a whole, improves the maintainability, readability, and understandability of the system shouldn't be delayed for days or weeks because it isn't "perfect."

Reviewers should _always_ feel free to leave comments expressing that something could be better, but if it's not very important, prefix it with something like "Nit: " to let the author know that it's just a point of polish that they could choose to ignore.

Note: Nothing in this document justifies checking in CLs that definitely _worsen_ the overall code health of the system. The only time you would do that would be in an [emergency](https://google.github.io/eng-practices/review/emergencies.html).

Mentoring
---------

Code review can have an important function of teaching developers something new about a language, a framework, or general software design principles. It's always fine to leave comments that help a developer learn something new. Sharing knowledge is part of improving the code health of a system over time. Just keep in mind that if your comment is purely educational, but not critical to meeting the standards described in this document, prefix it with "Nit: " or otherwise indicate that it's not mandatory for the author to resolve it in this CL.

Principles
----------

*   Technical facts and data overrule opinions and personal preferences.
    
*   On matters of style, the [style guide](http://google.github.io/styleguide/) is the absolute authority. Any purely style point (whitespace, etc.) that is not in the style guide is a matter of personal preference. The style should be consistent with what is there. If there is no previous style, accept the author's.
    
*   **Aspects of software design are almost never a pure style issue or just a personal preference.** They are based on underlying principles and should be weighed on those principles, not simply by personal opinion. Sometimes there are a few valid options. If the author can demonstrate (either through data or based on solid engineering principles) that several approaches are equally valid, then the reviewer should accept the preference of the author. Otherwise the choice is dictated by standard principles of software design.
    
*   If no other rule applies, then the reviewer may ask the author to be consistent with what is in the current codebase, as long as that doesn't worsen the overall code health of the system.
    

Resolving Conflicts
-------------------

In any conflict on a code review, the first step should always be for the developer and reviewer to try to come to consensus, based on the contents of this document and the other documents in [The CL Author's Guide](https://google.github.io/eng-practices/review/developer/) and this [Reviewer Guide](https://google.github.io/eng-practices/review/reviewer/).

When coming to consensus becomes especially difficult, it can help to have a face-to-face meeting or a video conference between the reviewer and the author, instead of just trying to resolve the conflict through code review comments. (If you do this, though, make sure to record the results of the discussion as a comment on the CL, for future readers.)

If that doesn't resolve the situation, the most common way to resolve it would be to escalate. Often the escalation path is to a broader team discussion, having a Technical Lead weigh in, asking for a decision from a maintainer of the code, or asking an Eng Manager to help out. **Don't let a CL sit around because the author and the reviewer can't come to an agreement.**

Next: [What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html)</content>
</page>

<page>
  <title>Navigating a CL in review</title>
  <url>https://google.github.io/eng-practices/review/reviewer/navigate.html</url>
  <content>
Summary
-------

Now that you know [what to look for](https://google.github.io/eng-practices/review/reviewer/looking-for.html), what's the most efficient way to manage a review that's spread across multiple files?

1.  Does the change make sense? Does it have a good [description](https://google.github.io/eng-practices/review/developer/cl-descriptions.html)?
2.  Look at the most important part of the change first. Is it well-designed overall?
3.  Look at the rest of the CL in an appropriate sequence.

Step One: Take a broad view of the change
-----------------------------------------

Look at the [CL description](https://google.github.io/eng-practices/review/developer/cl-descriptions.html) and what the CL does in general. Does this change even make sense? If this change shouldn't have happened in the first place, please respond immediately with an explanation of why the change should not be happening. When you reject a change like this, it's also a good idea to suggest to the developer what they should have done instead.

For example, you might say "Looks like you put some good work into this, thanks! However, we're actually going in the direction of removing the FooWidget system that you're modifying here, and so we don't want to make any new modifications to it right now. How about instead you refactor our new BarWidget class?"

Note that not only did the reviewer reject the current CL and provide an alternative suggestion, but they did it _courteously_. This kind of courtesy is important because we want to show that we respect each other as developers even when we disagree.

If you get more than a few CLs that represent changes you don't want to make, you should consider re-working your team's development process or the posted process for external contributors so that there is more communication before CLs are written. It's better to tell people "no" before they've done a ton of work that now has to be thrown away or drastically re-written.

Step Two: Examine the main parts of the CL
------------------------------------------

Find the file or files that are the "main" part of this CL. Often, there is one file that has the largest number of logical changes, and it's the major piece of the CL. Look at these major parts first. This helps give context to all of the smaller parts of the CL, and generally accelerates doing the code review. If the CL is too large for you to figure out which parts are the major parts, ask the developer what you should look at first, or ask them to [split up the CL into multiple CLs](https://google.github.io/eng-practices/review/developer/small-cls.html).

If you see some major design problems with this part of the CL, you should send those comments immediately, even if you don't have time to review the rest of the CL right now. In fact, reviewing the rest of the CL might be a waste of time, because if the design problems are significant enough, a lot of the other code under review is going to disappear and not matter anyway.

There are two major reasons it's so important to send these major design comments out immediately:

*   Developers often mail a CL and then immediately start new work based on that CL while they wait for review. If there are major design problems in the CL you're reviewing, they're also going to have to re-work their later CL. You want to catch them before they've done too much extra work on top of the problematic design.
*   Major design changes take longer to do than small changes. Developers nearly all have deadlines; in order to make those deadlines and still have quality code in the codebase, the developer needs to start on any major re-work of the CL as soon as possible.

Step Three: Look through the rest of the CL in an appropriate sequence
----------------------------------------------------------------------

Once you've confirmed there are no major design problems with the CL as a whole, try to figure out a logical sequence to look through the files while also making sure you don't miss reviewing any file. Usually after you've looked through the major files, it's simplest to just go through each file in the order that the code review tool presents them to you. Sometimes it's also helpful to read the tests first before you read the main code, because then you have an idea of what the change is supposed to be doing.

</content>
</page>

<page>
  <title>What to look for in a code review</title>
  <url>https://google.github.io/eng-practices/review/reviewer/looking-for.html</url>
  <content>
Note: Always make sure to take into account [The Standard of Code Review](https://google.github.io/eng-practices/review/reviewer/standard.html) when considering each of these points.

Design
------

The most important thing to cover in a review is the overall design of the CL. Do the interactions of various pieces of code in the CL make sense? Does this change belong in your codebase, or in a library? Does it integrate well with the rest of your system? Is now a good time to add this functionality?

Functionality
-------------

Does this CL do what the developer intended? Is what the developer intended good for the users of this code? The "users" are usually both end-users (when they are affected by the change) and developers (who will have to "use" this code in the future).

Mostly, we expect developers to test CLs well-enough that they work correctly by the time they get to code review. However, as the reviewer you should still be thinking about edge cases, looking for concurrency problems, trying to think like a user, and making sure that there are no bugs that you see just by reading the code.

You _can_ validate the CL if you want—the time when it's most important for a reviewer to check a CL's behavior is when it has a user-facing impact, such as a **UI change**. It's hard to understand how some changes will impact a user when you're just reading the code. For changes like that, you can have the developer give you a demo of the functionality if it's too inconvenient to patch in the CL and try it yourself.

Another time when it's particularly important to think about functionality during a code review is if there is some sort of **parallel programming** going on in the CL that could theoretically cause deadlocks or race conditions. These sorts of issues are very hard to detect by just running the code and usually need somebody (both the developer and the reviewer) to think through them carefully to be sure that problems aren't being introduced. (Note that this is also a good reason not to use concurrency models where race conditions or deadlocks are possible—it can make it very complex to do code reviews or understand the code.)

Complexity
----------

Is the CL more complex than it should be? Check this at every level of the CL—are individual lines too complex? Are functions too complex? Are classes too complex? "Too complex" usually means **"can't be understood quickly by code readers."** It can also mean **"developers are likely to introduce bugs when they try to call or modify this code."**

A particular type of complexity is **over-engineering**, where developers have made the code more generic than it needs to be, or added functionality that isn't presently needed by the system. Reviewers should be especially vigilant about over-engineering. Encourage developers to solve the problem they know needs to be solved _now_, not the problem that the developer speculates _might_ need to be solved in the future. The future problem should be solved once it arrives and you can see its actual shape and requirements in the physical universe.

Tests
-----

Ask for unit, integration, or end-to-end tests as appropriate for the change. In general, tests should be added in the same CL as the production code unless the CL is handling an [emergency](https://google.github.io/eng-practices/review/emergencies.html).

Make sure that the tests in the CL are correct, sensible, and useful. Tests do not test themselves, and we rarely write tests for our tests—a human must ensure that tests are valid.

Will the tests actually fail when the code is broken? If the code changes beneath them, will they start producing false positives? Does each test make simple and useful assertions? Are the tests separated appropriately between different test methods?

Remember that tests are also code that has to be maintained. Don't accept complexity in tests just because they aren't part of the main binary.

Naming
------

Did the developer pick good names for everything? A good name is long enough to fully communicate what the item is or does, without being so long that it becomes hard to read.

Did the developer write clear comments in understandable English? Are all of the comments actually necessary? Usually comments are useful when they **explain why** some code exists, and should not be explaining _what_ some code is doing. If the code isn't clear enough to explain itself, then the code should be made simpler. There are some exceptions (regular expressions and complex algorithms often benefit greatly from comments that explain what they're doing, for example) but mostly comments are for information that the code itself can't possibly contain, like the reasoning behind a decision.

It can also be helpful to look at comments that were there before this CL. Maybe there is a TODO that can be removed now, a comment advising against this change being made, etc.

Note that comments are different from _documentation_ of classes, modules, or functions, which should instead express the purpose of a piece of code, how it should be used, and how it behaves when used.

Style
-----

We have [style guides](http://google.github.io/styleguide/) for all of our major languages, and even for most of the minor languages. Make sure the CL follows the appropriate style guides.

If you want to improve some style point that isn't in the style guide, prefix your comment with "Nit:" to let the developer know that it's a nitpick that you think would improve the code but isn't mandatory. Don't block CLs from being submitted based only on personal style preferences.

The author of the CL should not include major style changes combined with other changes. It makes it hard to see what is being changed in the CL, makes merges and rollbacks more complex, and causes other problems. For example, if the author wants to reformat the whole file, have them send you just the reformatting as one CL, and then send another CL with their functional changes after that.

Consistency
-----------

What if the existing code is inconsistent with the style guide? Per our [code review principles](https://google.github.io/eng-practices/review/reviewer/standard.html#principles), the style guide is the absolute authority: if something is required by the style guide, the CL should follow the guidelines.

In some cases, the style guide makes recommendations rather than declaring requirements. In these cases, it's a judgment call whether the new code should be consistent with the recommendations or the surrounding code. Bias towards following the style guide unless the local inconsistency would be too confusing.

If no other rule applies, the author should maintain consistency with the existing code.

Either way, encourage the author to file a bug and add a TODO for cleaning up existing code.

Documentation
-------------

If a CL changes how users build, test, interact with, or release code, check to see that it also updates associated documentation, including READMEs, documentation pages, and any generated reference docs. If the CL deletes or deprecates code, consider whether the documentation should also be deleted. If documentation is missing, ask for it.

Every Line
----------

In the general case, look at _every_ line of code that you have been assigned to review. Some things like data files, generated code, or large data structures you can scan over sometimes, but don't scan over a human-written class, function, or block of code and assume that what's inside of it is okay. Obviously some code deserves more careful scrutiny than other code—that's a judgment call that you have to make—but you should at least be sure that you _understand_ what all the code is doing.

If it's too hard for you to read the code and this is slowing down the review, then you should let the developer know that and wait for them to clarify it before you try to review it. We hire great software engineers, and you are one of them. If you can't understand the code, it's very likely that other developers won't either. So you're also helping future developers understand this code, when you ask the developer to clarify it.

If you understand the code but you don't feel qualified to do some part of the review, [make sure there is a reviewer](#every-line-exceptions) on the CL who is qualified, particularly for complex issues such as privacy, security, concurrency, accessibility, internationalization, etc.

### Exceptions

What if it doesn't make sense for you to review every line? For example, you are one of multiple reviewers on a CL and may be asked:

*   To review only certain files that are part of a larger change.
*   To review only certain aspects of the CL, such as the high-level design, privacy or security implications, etc.

In these cases, note in a comment which parts you reviewed. Prefer giving [LGTM with comments](https://google.github.io/eng-practices/review/reviewer/speed.html#lgtm-with-comments) .

If you instead wish to grant LGTM after confirming that other reviewers have reviewed other parts of the CL, note this explicitly in a comment to set expectations. Aim to [respond quickly](https://google.github.io/eng-practices/review/reviewer/speed.html#responses) once the CL has reached the desired state.

Context
-------

It is often helpful to look at the CL in a broad context. Usually the code review tool will only show you a few lines of code around the parts that are being changed. Sometimes you have to look at the whole file to be sure that the change actually makes sense. For example, you might see only four new lines being added, but when you look at the whole file, you see those four lines are in a 50-line method that now really needs to be broken up into smaller methods.

It's also useful to think about the CL in the context of the system as a whole. Is this CL improving the code health of the system or is it making the whole system more complex, less tested, etc.? **Don't accept CLs that degrade the code health of the system.** Most systems become complex through many small changes that add up, so it's important to prevent even small complexities in new changes.

Good Things
-----------

If you see something nice in the CL, tell the developer, especially when they addressed one of your comments in a great way. Code reviews often just focus on mistakes, but they should offer encouragement and appreciation for good practices, as well. It's sometimes even more valuable, in terms of mentoring, to tell a developer what they did right than to tell them what they did wrong.

Summary
-------

In doing a code review, you should make sure that:

*   The code is well-designed.
*   The functionality is good for the users of the code.
*   Any UI changes are sensible and look good.
*   Any parallel programming is done safely.
*   The code isn't more complex than it needs to be.
*   The developer isn't implementing things they _might_ need in the future but don't know they need now.
*   Code has appropriate unit tests.
*   Tests are well-designed.
*   The developer used clear names for everything.
*   Comments are clear and useful, and mostly explain _why_ instead of _what_.
*   Code is appropriately documented.
*   The code conforms to our style guides.

Make sure to review **every line** of code you've been asked to review, look at the **context**, make sure you're **improving code health**, and compliment developers on **good things** that they do.
</page>

<page>
  <title>How to write code review comments</title>
  <url>https://google.github.io/eng-practices/review/reviewer/comments.html</url>
  <content>[eng-practices](https://google.github.io/eng-practices/)
--------------------------------------------------------

Summary
-------

*   Be kind.
*   Explain your reasoning.
*   Balance giving explicit directions with just pointing out problems and letting the developer decide.
*   Encourage developers to simplify code or add code comments instead of just explaining the complexity to you.

Courtesy
--------

In general, it is important to be [courteous and respectful](https://chromium.googlesource.com/chromium/src/+/master/docs/cr_respect.md) while also being very clear and helpful to the developer whose code you are reviewing. One way to do this is to be sure that you are always making comments about the _code_ and never making comments about the _developer_. You don't always have to follow this practice, but you should definitely use it when saying something that might otherwise be upsetting or contentious. For example:

Bad: "Why did **you** use threads here when there's obviously no benefit to be gained from concurrency?"

Good: "The concurrency model here is adding complexity to the system without any actual performance benefit that I can see. Because there's no performance benefit, it's best for this code to be single-threaded instead of using multiple threads."

Explain Why
-----------

One thing you'll notice about the "good" example from above is that it helps the developer understand _why_ you are making your comment. You don't always need to include this information in your review comments, but sometimes it's appropriate to give a bit more explanation around your intent, the best practice you're following, or how your suggestion improves code health.

Giving Guidance
---------------

**In general it is the developer's responsibility to fix a CL, not the reviewer's.** You are not required to do detailed design of a solution or write code for the developer.

This doesn't mean the reviewer should be unhelpful, though. In general you should strike an appropriate balance between pointing out problems and providing direct guidance. Pointing out problems and letting the developer make a decision often helps the developer learn, and makes it easier to do code reviews. It also can result in a better solution, because the developer is closer to the code than the reviewer is.

However, sometimes direct instructions, suggestions, or even code are more helpful. The primary goal of code review is to get the best CL possible. A secondary goal is improving the skills of developers so that they require less and less review over time.

Remember that people learn from reinforcement of what they are doing well and not just what they could do better. If you see things you like in the CL, comment on those too! Examples: developer cleaned up a messy algorithm, added exemplary test coverage, or you as the reviewer learned something from the CL. Just as with all comments, include [why](#why) you liked something, further encouraging the developer to continue good practices.

Consider labeling the severity of your comments, differentiating required changes from guidelines or suggestions.

Here are some examples:

> Nit: This is a minor thing. Technically you should do it, but it won't hugely impact things.
> 
> Optional (or Consider): I think this may be a good idea, but it's not strictly required.
> 
> FYI: I don't expect you to do this in this CL, but you may find this interesting to think about for the future.

This makes review intent explicit and helps authors prioritize the importance of various comments. It also helps avoid misunderstandings; for example, without comment labels, authors may interpret all comments as mandatory, even if some comments are merely intended to be informational or optional.

Accepting Explanations
----------------------

If you ask a developer to explain a piece of code that you don't understand, that should usually result in them **rewriting the code more clearly**. Occasionally, adding a comment in the code is also an appropriate response, as long as it's not just explaining overly complex code.

**Explanations written only in the code review tool are not helpful to future code readers.** They are acceptable only in a few circumstances, such as when you are reviewing an area you are not very familiar with and the developer explains something that normal readers of the code would have already known.
</content>
</page>
```


