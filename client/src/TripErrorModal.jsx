import { useRef, useEffect } from "react";


export default function TripErrorModal({isOpen, closeModal}){
   
    // const modalRef = useRef<HTMLDialogElement>(null);
   
    const modalRef = useRef(null);

    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return;
    
        if (isOpen) {
          modalElement.showModal();
        } else {
          modalElement.close();
        }
      }, [isOpen]);

    function handleXClick(){
        closeModal()
    }
    
    return (
        <dialog ref={modalRef} className="modal">
            <button className="x-button" onClick={handleXClick}>X</button>
            <h2>Too Many Transfers!!!!</h2>
            <hr width="100%" size="2"/>
            <p>Your trip requires more than one transfer to get from origin to destination.</p>
            <p>A robust subway pathfinding algorithm is in the works, but until then,</p>
            <p>please keep your trips to one transfer. It's better that way anyway!</p>
        </dialog>
        // <div>popup</div>
    );
      
}