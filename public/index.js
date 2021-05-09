/* global $ fetch */

$(document).ready(function () {
  fetch('/sessions')
    .then(response => response.json())
    .then(data => {
      var table = $('#scheduleTable').DataTable({
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
          {data: 'duration'},
          {data: 'time'},
          {data: 'name'},
          {data: 'host'},
          {data: 'description'}
        ]
      })
      $('.dataTables_length').addClass('bs-select')

      $('#scheduleTable tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data()
        window.alert(`${data[1]}  clicked!`)
      })
      // full row clickable with data-href
      $('#scheduleTable tbody tr').click(function () {
        window.location.href = $(this).data('href')
      })
    })
})
