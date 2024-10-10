<script>
    let patientName = '';
    let dateOfAdmission = '';
    let dateOfDischarge = '';
    let diagnosis = '';
    let attendingPhysician = '';
    let hospital = '';
    let report_html;
    let iframeSrc;

    
    const handleSubmit = async (event) => {
        event.preventDefault();
        let values={
            patientName,
            dateOfAdmission,
            dateOfDischarge,
            diagnosis,
            attendingPhysician,
            hospital
        };
        const response = await fetch('/reportgen/query/', {
				method: 'POST',
                body: JSON.stringify({values})
			});
        const {report} = await response.json();
        report_html=report;
       
        const blob = new Blob([report_html], { type: 'text/html' });
        iframeSrc = URL.createObjectURL(blob);

    };
    let download=async () => {
        const { default: html2pdf } = await import('html2pdf.js');

        const opt = {
            margin:       1,
            filename:     'report.pdf',
            html2canvas:  { scale: 1 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };


        const element = document.createElement('div');
        element.innerHTML = report_html;

        html2pdf().from(element).set(opt).save();

    }
</script>
<div class="flex flex-col justify-center items-center w-screen">
    {#if report_html}
    <iframe title="Report" src={iframeSrc} width="50%" height="600px" style="border: none;"></iframe>
    <button type="button" class="mt-4 w-1/4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700" on:click={download}>Download</button>

    {:else}
<div class="w-5/12 bg-[#ffffff33] backdrop:blur-[30px] border-[1px] border-[#FFFFFF80]  p-6 rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold mb-4">Patient Discahrge Form</h1>
    <form on:submit={handleSubmit} class="space-y-4">
        <div>
            <label for="patientName" class="block text-sm font-medium text-gray-700">Patient Name</label>
            <input type="text" id="patientName" bind:value={patientName} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500" />
        </div>

        <div>
            <label for="dateOfAdmission" class="block text-sm font-medium text-gray-700">Date of Admission</label>
            <input type="date" id="dateOfAdmission" bind:value={dateOfAdmission} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500" />
        </div>

        <div>
            <label for="dateOfDischarge" class="block text-sm font-medium text-gray-700">Date of Discharge</label>
            <input type="date" id="dateOfDischarge" bind:value={dateOfDischarge} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500" />
        </div>

        <div>
            <label for="diagnosis" class="block text-sm font-medium text-gray-700">Diagnosis</label>
            <input type="text" id="diagnosis" bind:value={diagnosis} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500" />
        </div>

        <div>
            <label for="attendingPhysician" class="block text-sm font-medium text-gray-700">Attending Physician</label>
            <input type="text" id="attendingPhysician" bind:value={attendingPhysician} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500" />
        </div>

        <div>
            <label for="hospital" class="block text-sm font-medium text-gray-700">Hospital</label>
            <input type="text" id="hospital" bind:value={hospital} required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500" />
        </div>

        <button type="submit" class="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Submit</button>
    </form>
</div>
{/if}
</div>

