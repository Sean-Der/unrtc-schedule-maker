/* global $ fetch bootstrap */

$(document).ready(function () {
  let table = null
  let errorModal = new bootstrap.Modal(document.getElementById('errorModal'), {});

  const populateSessions = () => {
    fetch('/sessions')
      .then(response => response.json())
      .then(data => {
        if (table) {
          table.clear()
          table.rows.add(data).draw()
          return
        }

        table = $('#scheduleTable').DataTable({
          data: data,
          paging: false,
          ordering: false,
          bInfo: false,
          fixedColumns: {
            leftColumns: 1
          },
          language: {
            search: '_INPUT_'
          },
          columns: [
            { data: 'duration' },
            { data: 'time' },
            { data: 'name' },
            { data: 'host' },
            { data: 'description' }
          ]
        })
        $('.dataTables_length').addClass('bs-select')

        $('#scheduleTable tbody').on('click', 'tr', event => {
          window.open(`https://unrtc.co/group/${event.currentTarget.rowIndex}`)
         })
      })
  }

  $('#submit-session-button').click(() => {
    const data = {
      time: 'Unscheduled',
      name: $('#inputSessionName').val(),
      host: $('#inputHostName').val(),
      duration: $('#inputDuration').val(),
      description: $('#inputDescription').val()
    }

    fetch('/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status !== 200) {
        errorModal.show()
      } else {
        $('input, textarea').each((i, el) => {
          $(el).val('')
        })
      }

      populateSessions()
    })
  })

  populateSessions()
})
