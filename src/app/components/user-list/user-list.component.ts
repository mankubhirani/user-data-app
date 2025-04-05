import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchText = '';
  sortColumn = '';
  pageNumber = 1;
  pageSize = 5;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data) => {
      this.users = this.filteredUsers = data;
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.pageNumber = 1;
  }

  sortBy(column: string) {
    this.filteredUsers.sort((a, b) => {
      const valA = column === 'company' ? a.company.name : a[column];
      const valB = column === 'company' ? b.company.name : b[column];
      return valA.localeCompare(valB);
    });
  }

  paginatedUsers() {
    const start = (this.pageNumber - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  showDetails(user: any) {
    alert(`User: ${user.name}\nEmail: ${user.email}\nCompany: ${user.company.name}`);
  }

  exportToCSV() {
    const csv = this.filteredUsers.map(u =>
      `${u.name},${u.email},${u.company.name}`
    ).join('\n');
    const blob = new Blob(["Name,Email,Company\n" + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportToPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Company']],
      body: this.filteredUsers.map(u => [u.name, u.email, u.company.name])
    });
    doc.save('users.pdf');
  }
}
