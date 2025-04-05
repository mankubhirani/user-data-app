import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  pageNumber: number = 1;
  pageSize: number = 5;
  searchText: string = '';
  selectedUser: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://jsonplaceholder.typicode.com/users').subscribe(data => {
      this.users = data;
      this.filteredUsers = [...this.users];
    });
  }

  paginatedUsers(): any[] {
    const start = (this.pageNumber - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  filterUsers() {
    const text = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(text) ||
      user.email.toLowerCase().includes(text)
    );
    this.pageNumber = 1;
  }

  showDetails(user: any) {
    this.selectedUser = user;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
  }

  exportToCSV() {
    const csv = Papa.unparse(this.filteredUsers.map(user => ({
      Name: user.name,
      Username: user.username,
      Email: user.email,
      City: user.address?.city,
      Street: user.address?.street,
      Company: user.company?.name
    })));

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'users.csv';
    link.click();
  }

  exportToPDF() {
    const doc = new jsPDF();
    const rows = this.filteredUsers.map(user => [
      user.name,
      user.username,
      user.email,
      user.address?.city,
      user.address?.street,
      user.company?.name
    ]);
    autoTable(doc, {
      head: [['Name', 'Username', 'Email', 'City', 'Street', 'Company']],
      body: rows,
    });
    doc.save('users.pdf');
  }
}
