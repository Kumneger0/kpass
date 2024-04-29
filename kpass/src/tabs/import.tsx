import React, { useRef } from "react"
import Papa from 'papaparse'

function Import() {

    const readCSV = (e : React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files
        if (!files?.length) return 
        Papa.parse(files[0], {
	complete: function(results) {
		console.log(results);
	}
});
     }



    return <div className="">
        <div>
            Read passwords from csv file 
        </div>
        <div>
            <input onChange={readCSV} type="file" className="p-3 rounded-lg" accept="text/csv" multiple={false} />
        </div>
    </div>
}

export default Import
