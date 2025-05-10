import { GiveawayWinner } from '@/types/giveaway';
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@components/ui/table';
import { Badge } from '@components/ui/badge';
import { format } from 'date-fns';

interface GiveawayWinnersListProps {
  winners: GiveawayWinner[];
}

export function GiveawayWinnersList({ winners }: GiveawayWinnersListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Winners</h2>

      <Table>
        <TableCaption>List of users who won this giveaway</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Message Status</TableHead>
            <TableHead>Like Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {winners.map((winner) => (
            <TableRow key={winner.id}>
              <TableCell className="font-medium">@{winner.username}</TableCell>
              <TableCell>{format(new Date(winner.createdAt), 'PP')}</TableCell>
              <TableCell>
                <Badge variant={winner.messageStatus === 'sent' ? 'success' : 'destructive'}>
                  {winner.messageStatus === 'sent' ? 'Sent' : 'Failed'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={winner.likeStatus === 'liked' ? 'success' : 'destructive'}>
                  {winner.likeStatus === 'liked' ? 'Liked' : 'Failed'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}