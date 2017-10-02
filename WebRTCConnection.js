/**
 * Created by forge on 02.10.2017.
 */
class WebRTCConnection {
    /**
     * Simple, no bullshit WebRTC datachannel. offer, answer, complete, and send.
     * @param {Function} doOnOpen
     * @param {Function} doOnClose
     * @param {Function} doOnStandby when the connection fails but may reopen again
     * @param {Function} doOnMessage
     * @param {int} timeout milliseconds
     */
    constructor(doOnOpen, doOnClose, doOnStandby, doOnMessage, timeout = 1000*60*60*24){
        this.peerConnection = new RTCPeerConnection(this.iceServers);
        this._completeOnOpen = () => {}; //callback hook for complete promise
        this.peerConnection.oniceconnectionstatechange = (event) => {
            if (this.peerConnection.iceConnectionState == "closed") {
                doOnClose(this);
            }
            if (this.peerConnection.iceConnectionState == "failed") {
                doOnStandby(this);
            }
            if (this.peerConnection.iceConnectionState == "connected") {
                this._completeOnOpen();
                doOnOpen(this);
            }
        };
        this.doOnMessage = (event) => doOnMessage(event.data);
        this.timeout = timeout;
        this.resolved = false;
        this.verbose = true;
    }

    /**
     * create a WebRTC offer sdp
     * @return {Promise} {String} sdp
     */
    offer(){
        this.peerConnection.utilityDataChannel = this.peerConnection.createDataChannel(
            "WebRTCConnectionUtility-1.0"
        );
        this.peerConnection.utilityDataChannel.onmessage = (event) => this.doOnMessage(event);
        if(this.peerConnection.localDescription.sdp) throw "offer or answer already made! (o)";
        this.peerConnection.createOffer().then(description =>
            this.peerConnection.setLocalDescription(description)
        );
        // timeout dropin \\
        this._completeOnOpen = () => {this.resolved = true;};
        setTimeout(() => {if(!this.resolved){
            this.peerConnection.close();
            if (this.verbose) throw "incomplete connection expired out after "+this.timeout+"ms. (o)";
        }}, this.timeout);
        // timeout dropin end \\
        return new Promise((accept,reject)=>{
            this.peerConnection.onicecandidate = event => {
                if (event.candidate) return;
                accept(this.peerConnection.localDescription.sdp);
            }
        });

    }
    /**
     * create an answer from an offer sdp
     * @param {String} sdp
     * @return {Promise} {String} sdp
     */
    answer(sdp){
        this.peerConnection.ondatachannel = (event) => {
            if (event.channel.label == "WebRTCConnectionUtility-1.0") {
                this.peerConnection.utilityDataChannel = event.channel;
                this.peerConnection.utilityDataChannel.onmessage = (event) => this.doOnMessage(event);
            } else {
                this.peerConnection.close();
                throw "incompatible WebRTCConnections! (a)"
            }
        };
        if(this.peerConnection.localDescription.sdp) throw "offer or answer already made! (a)";
        this.peerConnection.setRemoteDescription(
            new RTCSessionDescription({
                type:"offer",
                sdp:sdp
            })
        ).then(
            () => this.peerConnection.createAnswer()
        ).then(
            description => this.peerConnection.setLocalDescription(description)
        );
        // timeout dropin \\
        this._completeOnOpen = () => {this.resolved = true;};
        setTimeout(() => {if(!this.resolved){
            this.peerConnection.close();
            if (this.verbose) throw "incomplete connection expired out after "+this.timeout+"ms. (a)";
        }}, this.timeout);
        // timeout dropin end \\
        return new Promise((accept,reject)=>{
            this.peerConnection.onicecandidate = event => {
                if (event.candidate) return;
                accept(this.peerConnection.localDescription.sdp);
            };
        });

    }
    /**
     * complete a connection
     * @param {String} sdp
     * @return {Promise} void on successfully established connection
     */
    complete(sdp){
        this.peerConnection.setRemoteDescription(
            new RTCSessionDescription({
                type: "answer",
                sdp: sdp
            })
        );
        return new Promise((accept, reject) => {
            this._completeOnOpen = () => {this.resolved = true; setTimeout(()=>accept(),100);};
            setTimeout(() => {if(!this.resolved){
                this.peerConnection.close();
                reject("incomplete connection expired out after "+this.timeout+"ms. (c)");
            }}, this.timeout)
        })
    }

    close(){
        if(this.peerConnection.iceConnectionState != "closed"){
            this.peerConnection.close();
        }
    }

    send(data){
        this.peerConnection.utilityDataChannel.send(data);
    }
}