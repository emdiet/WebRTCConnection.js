/**
 * Created by forge on 02.10.2017.
 */

const connFact = (id, timeout = 1000) => {
    return new WebRTCConnection(
        ()=>console.log("c"+id+":open"),
        ()=>console.log("c"+id+":close"),
        ()=>console.log("c"+id+":standby"),
        (message)=>{
            console.log("c"+id+": receives:");
            console.log(message)
        },
        timeout
    );
};


// try connection
const c1 = connFact(1);
const c2 = connFact(3);

c1.offer().
then(sdp => c2.answer(sdp)).
then(sdp => c1.complete(sdp)).
then(()=>console.log("boop"));

// try timeout
try{
    //offer
    connFact(3).offer()

    const c4 = connFact(4);
    const c5 = connFact(5);

    //answer
    c4.offer().
    then(sdp => c5.answer(sdp));

} catch (e){
    console.log("c3 error:");
    console.log(e);
}

// try messaging
const c6 = connFact(6);
const c7 = connFact(7);

c6.offer().
then(sdp => c7.answer(sdp)).
then(sdp => c6.complete(sdp)).
then(()=>{
    console.log("ready for messaging")
    c7.send("boo")
});